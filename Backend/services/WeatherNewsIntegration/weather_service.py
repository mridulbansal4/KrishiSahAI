import os
import httpx
import asyncio

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("WEATHER_API_KEY")
        self.base_url = "http://api.weatherapi.com/v1"
        if not self.api_key:
            print("Warning: WEATHER_API_KEY not found in environment variables.")

    async def get_weather(self, location: str):
        """
        Fetches current weather and forecast for a given location asynchronously.
        """
        if not self.api_key:
            return {"error": "Weather API key not configured"}

        url = f"{self.base_url}/forecast.json"
        params = {
            "key": self.api_key,
            "q": location,
            "days": 1, 
            "aqi": "no",
            "alerts": "no"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return self.preprocess_weather_data(data)
            except httpx.RequestError as e:
                print(f"Weather API Request Error: {e}")
                return {"error": f"Failed to connect to Weather API: {str(e)}"}
            except httpx.HTTPStatusError as e:
                print(f"Weather API Status Error: {e}")
                return {"error": f"Weather API returned error: {e.response.status_code}"}
            except Exception as e:
                 print(f"Weather Service Error: {e}")
                 return {"error": f"An unexpected error occurred: {str(e)}"}

    def preprocess_weather_data(self, raw_data):
        """
        Extracts only essential parameters:
        temperature, humidity, wind_speed, rainfall_probability, daily_max_temp, daily_min_temp
        """
        if not raw_data or "error" in raw_data:
            return raw_data

        try:
            current = raw_data.get("current", {})
            forecast = raw_data.get("forecast", {}).get("forecastday", [])[0].get("day", {})
            
            processed = {
                "temperature": current.get("temp_c"),
                "humidity": current.get("humidity"),
                "wind_speed": current.get("wind_kph"),
                "condition": current.get("condition", {}).get("text"),
                "daily_max_temp": forecast.get("maxtemp_c"),
                "daily_min_temp": forecast.get("mintemp_c"),
                "rainfall_probability": forecast.get("daily_chance_of_rain")
            }
            return processed
        except Exception as e:
             print(f"Error preprocessing weather data: {e}")
             return {"error": "Failed to process weather data"}

# Usage example (for testing)
if __name__ == "__main__":
    async def main():
        service = WeatherService()
        weather = await service.get_weather("Pune")
        print(weather)
    
    # asyncio.run(main()) 
