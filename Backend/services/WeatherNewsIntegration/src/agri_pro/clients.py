import requests

class WeatherAPIClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.weatherapi.com/v1"

    def get_weather(self, location):
        """
        Fetches current weather and forecast for a given location.
        """
        if not self.api_key:
            return {"error": "WeatherAPI key not provided"}

        url = f"{self.base_url}/forecast.json"
        params = {
            "key": self.api_key,
            "q": location,
            "days": 3,
            "aqi": "no",
            "alerts": "yes"
        }
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to fetch weather data: {str(e)}"}

class GNewsClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://gnews.io/api/v4"

    def get_agri_news(self, query, language="en", country="in", max_results=10):
        """
        Fetches agriculture-related news based on keywords.
        """
        if not self.api_key:
            return {"error": "GNews API key not provided"}

        url = f"{self.base_url}/search"
        params = {
            "q": query,
            "lang": language,
            "country": country,
            "max": max_results,
            "apikey": self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to fetch news: {str(e)}"}
