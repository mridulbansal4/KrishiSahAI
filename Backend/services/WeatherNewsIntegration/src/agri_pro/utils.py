def extract_keywords(farmer_profile):
    """
    Extracts relevant keywords from the farmer profile for news searching.
    """
    keywords = []
    
    # Extract crop names
    if "crops" in farmer_profile:
        keywords.extend(farmer_profile["crops"])
    
    # Extract location
    if "location" in farmer_profile:
        if "district" in farmer_profile["location"]:
            keywords.append(farmer_profile["location"]["district"])
        if "state" in farmer_profile["location"]:
            keywords.append(farmer_profile["location"]["state"])
            
    # Add general agri terms
    keywords.append("agriculture")
    keywords.append("farming")
    
    # Join with OR for the query part that is variable, or let the caller handle logic
    # Returning list for now
    return list(set(keywords))

def construct_news_query(keywords):
    """
    Constructs a query string for GNews.
    Example: (Wheat OR Punjab) AND (agriculture OR farming)
    """
    # This is a simplified construction. 
    # Better approach: combine specific terms with general terms.
    
    specific_terms = [k for k in keywords if k not in ["agriculture", "farming"]]
    general_terms = ["agriculture", "farming", "kisan", "crop", "weather"]
    
    query = ""
    if specific_terms:
        query += "(" + " OR ".join([f'"{t}"' for t in specific_terms]) + ") AND "
    
    query += "(" + " OR ".join([f'"{t}"' for t in general_terms]) + ")"
    
    return query

def simplify_weather(weather_data):
    """
    Simplifies the weather API response to reduce token usage.
    Extracts only key fields required for the advisory.
    """
    if not weather_data or "error" in weather_data:
        return {}

    simplified = {}
    
    # Current Weather
    if "current" in weather_data:
        current = weather_data["current"]
        simplified["current_temp_c"] = current.get("temp_c")
        simplified["feels_like_c"] = current.get("feelslike_c")
        simplified["condition"] = current.get("condition", {}).get("text")
        simplified["humidity"] = current.get("humidity")
        simplified["wind_kph"] = current.get("wind_kph")
        
    # Forecast for today (Index 0)
    if "forecast" in weather_data and "forecastday" in weather_data["forecast"]:
        if len(weather_data["forecast"]["forecastday"]) > 0:
            today = weather_data["forecast"]["forecastday"][0]
            if "day" in today:
                day = today["day"]
                simplified["max_temp_c"] = day.get("maxtemp_c")
                simplified["min_temp_c"] = day.get("mintemp_c")
                simplified["daily_chance_of_rain"] = day.get("daily_chance_of_rain")
            
    return simplified

def simplify_news(news_data, max_items=5):
    """
    Simplifies the GNews API response.
    Returns a list of top N articles with title, source, and short summary.
    """
    if not news_data or "articles" not in news_data:
        return []
        
    articles = news_data.get("articles", [])
    simplified_news = []
    
    for article in articles[:max_items]:
        summary = article.get("description", "")
        # Truncate summary if too long (approx 200 chars)
        if summary and len(summary) > 200:
            summary = summary[:197] + "..."
            
        simplified_news.append({
            "title": article.get("title"),
            "source": article.get("source", {}).get("name"),
            "summary": summary
        })
        
    return simplified_news
