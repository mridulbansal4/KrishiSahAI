from datetime import datetime

def get_demo_notifications(user_id):
    try:
        return [
            {
                "id": 1,
                "title": "🌧️ Severe weather alert",
                "message": "Heavy rainfall expected in your area.",
                "type": "weather",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False
            },
            {
                "id": 2,
                "title": "📈 MSP Update",
                "message": "Wheat prices increased by ₹150/quintal.",
                "type": "market",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False
            },
            {
                "id": 3,
                "title": "🌱 Crop Advisory",
                "message": "Ideal time to sow Rabi crops.",
                "type": "advisory",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False
            },
            {
                "id": 4,
                "title": "🐛 Pest Alert",
                "message": "Brown planthopper activity reported nearby.",
                "type": "pest",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False
            }
        ]
    except Exception:
        return []
