from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import JsonOutputParser
from services.FarmHealth.src.prompts import HEALTH_ANALYSIS_SYSTEM_PROMPT, HEALTH_GUARDRAIL_PROMPT
import json
import os
import threading

class FarmHealthEngine:
    def __init__(self):
        # FIX: Ensure consistent model and url naming
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.lock = threading.Lock()
        
        # Optimized for JSON extraction
        self.json_llm = ChatOllama(
            model=self.model_name,
            temperature=0.1,  # Low temp is critical for JSON stability
            format="json",     # Forces Llama 3.2 into JSON mode
            base_url=self.base_url,
            num_predict=1500
        )
        
        # Optimized for conversational chat
        self.chat_llm = ChatOllama(
            model=self.model_name,
            temperature=0.4,
            base_url=self.base_url,
            num_predict=1500
        )

    def analyze_health(self, crop_name: str, soil_data: dict, location: str, soil_type: str, language: str = "English") -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", HEALTH_ANALYSIS_SYSTEM_PROMPT + "\n" + HEALTH_GUARDRAIL_PROMPT),
            ("human", "Analyze recommendations for {crop_name} in {location}. Output in {language} where possible."),
        ])
        
        chain = prompt | self.json_llm | JsonOutputParser()

        # Build context from your input variables
        soil_context = (
            f"Soil Type: {soil_type}, Location: {location}, "
            f"N-P-K: {soil_data.get('n')}-{soil_data.get('p')}-{soil_data.get('k')}, "
            f"pH: {soil_data.get('ph')}"
        )

        try:
            with self.lock:
                print(f"[FARM_HEALTH] Processing request for: {crop_name}")
                # Langchain chain.invoke handles the dictionary mapping
                response = chain.invoke({
                    "crop_name": crop_name, 
                    "location": location,
                    "soil_data": soil_context,
                    "language": language
                })
                return response
        except Exception as e:
            print(f"Error in FarmHealthEngine: {e}")
            # Ensure we return valid JSON even on error so UI stops loading
            return self.get_error_fallback()

    def get_error_fallback(self):
        return {
            "fertilizer_options": [
                {
                    "name": "Standard Urea/DAP",
                    "action": "Immediate Nutrient Supply",
                    "quantity": "As per local bags",
                    "timing": "Immediate",
                    "advantages": ["Reliable", "Subsidized"]
                }
            ],
            "market_advice": {"timing": "Hold", "rationale": "Service timeout", "confidence_percentage": 0, "confidence_label": "Error"},
            "insights": ["AI Service is currently overloaded. Please retry."]
        }