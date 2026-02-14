import os
import httpx
import asyncio

class NewsService:
    def __init__(self):
        self.api_key = os.getenv("GNEWS_API_KEY")
        self.base_url = "https://gnews.io/api/v4"
        if not self.api_key:
             print("Warning: GNEWS_API_KEY not found in environment variables.")

    async def get_personalized_news(self, crops: list, location: str = "India"):
        """
        Fetches personalized news based on crops and location.
        """
        if not self.api_key:
             return {"error": "News API key not configured"}
             
        query = self._generate_news_query(crops, location)
        
        url = f"{self.base_url}/search"
        params = {
            "q": query,
            "lang": "en", # Default to English for now, API supports others
            "country": "in",
            "max": 8,
            "apikey": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return self.preprocess_news(data)
            except httpx.RequestError as e:
                print(f"News API Request Error: {e}")
                return {"error": f"Failed to connect to News API: {str(e)}"}
            except httpx.HTTPStatusError as e:
                print(f"News API Status Error: {e}")
                return {"error": f"News API returned error: {e.response.status_code}"}
            except Exception as e:
                 print(f"News Service Error: {e}")
                 return {"error": f"An unexpected error occurred: {str(e)}"}

    def _generate_news_query(self, crops, location):
        """
        Generates a search query for GNews.
        Example: "(soybean OR cotton) AND (farming OR agriculture) AND India"
        """
        crop_terms = " OR ".join([f'"{c}"' for c in crops]) if crops else "agriculture"
        if crops:
             crop_query = f"({crop_terms})"
        else:
             crop_query = "agriculture"
             
        # Add general farming context to avoid irrelevant news (e.g. stock market 'cotton')
        query = f"{crop_query} AND (farming OR agriculture OR pest OR weather)"
        
        # Add location if valid
        if location and location.lower() != "unknown":
            query += f' AND "{location}"'
            
        return query

    def preprocess_news(self, raw_data):
        """
        Keeps only: headline, source, short summary, url
        """
        if not raw_data or "articles" not in raw_data:
            return []
            
        articles = raw_data.get("articles", [])
        processed = []
        
        for article in articles:
            summary = article.get("description", "")
            if summary and len(summary) > 200:
                summary = summary[:197] + "..."
                
            processed.append({
                "headline": article.get("title"),
                "source": article.get("source", {}).get("name"),
                "summary": summary,
                "url": article.get("url"),
                "published_at": article.get("publishedAt"),
                "image": article.get("image"), # Helpful for UI
                "content": article.get("content") # Full/Truncated content
            })
            
        return processed

# Usage example
if __name__ == "__main__":
    async def main():
        service = NewsService()
        news = await service.get_personalized_news(["wheat", "rice"], "Punjab")
        print(news)
    # asyncio.run(main())
