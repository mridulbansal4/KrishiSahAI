import json
import requests
import os
from .clients import WeatherAPIClient, GNewsClient
from .utils import extract_keywords, construct_news_query, simplify_weather, simplify_news

class AgriAgent:
    def __init__(self):
        # Load configuration from environment
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
        self.ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")

        # Initialize new services
        from ...weather_service import WeatherService
        from ...news_service import NewsService
        
        self.weather_service = WeatherService()
        self.news_service = NewsService()

    async def generate_advisory(self, farmer_profile, news_count=5):
        """
        Generates a personalized advisory for the farmer.
        """
        # 1. Fetch Weather
        location_parts = []
        if "district" in farmer_profile.get("location", {}):
            location_parts.append(farmer_profile["location"]["district"])
        if "state" in farmer_profile.get("location", {}):
            location_parts.append(farmer_profile["location"]["state"])
        
        location_query = ", ".join(location_parts)
        if not location_query:
            location_query = "India" # Fallback
            
        print(f"Fetching integrated weather for {location_query}...")
        weather_data = await self.weather_service.get_weather(location_query)
        
        # 2. Fetch News
        crops = farmer_profile.get("crops", [])
        print(f"Fetching integrated news for crops: {crops}...")
        news_data = await self.news_service.get_personalized_news(crops, location_query)
        
        if isinstance(news_data, dict) and "error" in news_data:
            print(f"News Error: {news_data['error']}")
            news_data = []
        elif isinstance(news_data, list):
            # Limit news items
            news_data = news_data[:news_count]
        else:
            news_data = []

        # 3. Construct Context for LLM
        context = {
            "farmer_profile": farmer_profile,
            "weather_data": weather_data,
            "news_data": news_data
        }

        # 4. Call LLM (Synchronous for now as it uses requests internally in _call_ollama, 
        # or we should async-ify that too. Keeping it sync for valid MVP step-by-step)
        print("Querying Ollama...")
        # Since _call_ollama is sync, we can call it directly. 
        # If we want full async, we should update _call_ollama too.
        advisory_json = self._call_ollama(context)
        
        return advisory_json

    def _call_ollama(self, context):
        """
        Calls the local Ollama instance with a system prompt and context.
        """
        system_prompt = """
Act as a professional agricultural risk advisor for the specific farmer profile provided.
Your output affects real farmers' decisions. Be precise, actionable, and conservative.

INPUT DATA Provided:
- Farmer Profile (Name, Location, Land, Soil, Crops, Market) -> USE THIS EXACTLY. DO NOT INVENT A PROFILE.
- Weather Data (Real-time from API) -> PRIMARY SOURCE.
- News Data (Real-time from API) -> SECONDARY SOURCE.

STRICT RULES:
1. **LOCATION**: Use the exact location in the profile ({profile_location}). DO NOT default to Nashik or any other place.
2. **WEATHER**: You MUST analyze the provided weather data. Mention temperature, condition, and any alerts. 
   - If weather data is missing/empty, state "Weather data currently unavailable".
3. **NEWS**: Summarize at least 5 relevant news items from the provided list.
4. **ADVICE**: tailored to the specific crops ({crops}) and soil ({soil}) provided.

OUTPUT FORMAT (JSON ONLY):
{
  "priority_level": "HIGH | MEDIUM | LOW",
  "weather_summary": "Detailed summary including temp, humidity, and condition. (e.g. 'Current temp is 35C with clear skies...')",
  "weather_alerts": ["Alert 1"],
  "relevant_agri_news": [
    {
      "headline": "Headline",
      "summary": "Summary"
    }
  ],
  "personalized_advice": [
    "Advice 1 (Specific to {crops} and {soil})",
    "Advice 2 (Based on {market_access})"
  ],
  "next_actions_for_farmer": [
    "Immediate Action 1",
    "Immediate Action 2"
  ]
}
"""
        # Inject dynamic values into prompt to force attention
        profile_location = f"{context['farmer_profile'].get('location', {}).get('district', '')}, {context['farmer_profile'].get('location', {}).get('state', '')}"
        crops = ", ".join(context['farmer_profile'].get('crops', []))
        soil = context['farmer_profile'].get('soil_type', '')
        market_access = context['farmer_profile'].get('market_access', '')
        
        system_prompt = system_prompt.replace("{profile_location}", profile_location)
        system_prompt = system_prompt.replace("{crops}", crops)
        system_prompt = system_prompt.replace("{soil}", soil)
        system_prompt = system_prompt.replace("{market_access}", market_access)

        user_message = json.dumps(context)

        payload = {
            "model": self.ollama_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "stream": False,
            "format": "json"
        }

        try:
            response = requests.post(f"{self.ollama_host}/api/chat", json=payload)
            response.raise_for_status()
            result = response.json()
            
            content = result.get("message", {}).get("content", "{}")
            return json.loads(content)
        except requests.exceptions.ConnectionError:
            print("\n[ERROR] Could not connect to Ollama.")
            print("Please ensure Ollama is running (`ollama serve`) and the model is pulled (`ollama pull llama3.2:1b`).")
            return {
                "error": "Ollama connection failed",
                "details": "Could not connect to localhost:11434. Is Ollama running?"
            }
        except Exception as e:
            return {
                "error": f"LLM generation failed: {str(e)}",
                "details": "Ensure Ollama is running and the model is pulled."
            }
