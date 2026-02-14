
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_talisman import Talisman
from dotenv import load_dotenv
import os
import sys
from pathlib import Path
from werkzeug.utils import secure_filename
import pandas as pd
import json
from middleware.auth import init_firebase, require_auth
import firebase_admin

# Load environment variables
load_dotenv()
init_firebase()

app = Flask(__name__)

@app.route('/ping')
def ping():
    return jsonify({'status': 'pong'}), 200

@app.before_request
def log_request():
    print(f"Incoming: {request.method} {request.url}")

# CORS Configuration - Must be set BEFORE Talisman
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173,http://localhost:3001').split(',')
CORS(app, resources={r"/api/*": {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})

# Security Headers - Disabled in development to avoid CORS conflicts
# TODO: Re-enable Talisman in production with proper CORS configuration
# Talisman(app, 
#     force_https=False,
#     content_security_policy=None,
#     content_security_policy_nonce_in=['script-src']
# )

# Configuration
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR)) # Ensure backend is in path
UPLOAD_FOLDER = str(BASE_DIR / 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Disease Detector Setup ---
DISEASE_DETECTOR_DIR = Path(__file__).resolve().parent / 'services' / 'Disease Detector'
if str(DISEASE_DETECTOR_DIR) not in sys.path:
    sys.path.append(str(DISEASE_DETECTOR_DIR))

from detector import predict as detector_predict, init_model as detector_init

# Warm up the model on server start
detector_init()

MODEL_FILE = DISEASE_DETECTOR_DIR / 'plant_disease_model.h5'
CSV_PATH = DISEASE_DETECTOR_DIR / 'crop_disease_data.csv'

disease_data = None
def load_disease_data():
    global disease_data
    try:
        if CSV_PATH.exists():
            disease_data = pd.read_csv(str(CSV_PATH))
            print("Disease data CSV loaded successfully")
        else:
            print(f"Warning: CSV file not found at {CSV_PATH}")
    except Exception as e:
        print(f"Error loading disease data: {e}")
load_disease_data()

# --- Business Advisor Setup ---
BUSINESS_ADVISOR_DIR = Path(__file__).resolve().parent / 'services' / 'Business Advisor'
if str(BUSINESS_ADVISOR_DIR) not in sys.path:
    sys.path.append(str(BUSINESS_ADVISOR_DIR))

from krishi_chatbot import KrishiSaarthiAdvisor, FarmerProfile
advisor_sessions = {}

# --- Waste To Value Setup ---
WASTE_TO_VALUE_DIR = Path(__file__).resolve().parent / 'services' / 'WasteToValue' / 'src'
if str(WASTE_TO_VALUE_DIR) not in sys.path:
    sys.path.append(str(WASTE_TO_VALUE_DIR))

from waste_service import WasteToValueEngine
waste_engine = None
try:
    print("Initializing Waste-to-Value Engine...")
    waste_engine = WasteToValueEngine()
    print("Waste-to-Value Engine initialized successfully")
except Exception as e:
    print(f"Warning: Waste-to-Value Engine failed to initialize: {e}")
    print("   The /api/waste-to-value endpoints will return errors until Ollama is available.")
    import traceback
    traceback.print_exc()

# --- Utilities ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_disease_info(crop_name, disease_name):
    if disease_data is None: return None
    try:
        match = disease_data[
            (disease_data['Crop Name'].str.lower() == crop_name.lower()) &
            (disease_data['Crop Disease'].str.lower() == disease_name.lower())
        ]
        if not match.empty:
            row = match.iloc[0]
            return {
                'crop': row['Crop Name'],
                'disease': row['Crop Disease'],
                'pathogen': row['Pathogen'],
                'home_remedy': row['Home Remedy'],
                'chemical_recommendation': row['Chemical Recommendation']
            }
    except Exception as e:
        print(f"Error getting disease info: {e}")
    return None

def predict_disease(image_path):
    try:
        return detector_predict(image_path)
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {
            'crop': 'Unknown',
            'disease': f'Error during detection: {e}',
            'confidence': 0.0,
            'severity': 'low'
        }

@app.route('/api/health')
def health_check():
    health_data = {'status': 'online'}
    
    # 1. GPU Check
    try:
        import tensorflow as tf
        gpus = tf.config.list_physical_devices('GPU')
        health_data['gpu'] = {
            'available': len(gpus) > 0,
            'count': len(gpus),
            'devices': [g.name for g in gpus]
        }
    except Exception as e:
        health_data['gpu'] = {'error': str(e)}

    # 2. Ollama Check
    try:
        import requests
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        # Fast timeout check
        resp = requests.get(f"{ollama_url}/api/tags", timeout=2)
        health_data['ollama'] = {
            'status': 'connected' if resp.status_code == 200 else 'error',
            'url': ollama_url
        }
    except Exception as e:
        health_data['ollama'] = {'status': 'disconnected', 'error': str(e)}

    # 3. System Memory (if psutil available)
    try:
        import psutil
        mem = psutil.virtual_memory()
        health_data['memory'] = f"{mem.available / (1024**3):.2f} GB available"
    except ImportError:
        health_data['memory'] = "psutil module not installed"
    except Exception as e:
         health_data['memory'] = str(e)

    return jsonify(health_data)

# --- Disease Detector Routes ---
@app.route('/api/disease/detect', methods=['POST'])
@require_auth
def detect_disease():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        filename = secure_filename(file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)
        
        print(f"[SCAN] Request received: {filename}")
        result = predict_disease(image_path)
        print(f"[SCAN] Result: {result.get('disease')} ({int(result.get('confidence',0)*100)}%)")
        
        disease_info = get_disease_info(result['crop'], result['disease'])
        
        treatment = []
        if disease_info:
            if disease_info['home_remedy'] and disease_info['home_remedy'] != 'N/A':
                treatment.append(disease_info['home_remedy'])
            if disease_info['chemical_recommendation'] and disease_info['chemical_recommendation'] != 'N/A':
                treatment.append(f"Chemical: {disease_info['chemical_recommendation']}")
        else:
            treatment = ['Remove affected leaves', 'Apply fungicide']
            
        try: os.remove(image_path)
        except: pass
        
        return jsonify({
            'success': True,
            'result': {
                'crop': result['crop'],
                'disease': result['disease'],
                'severity': result['severity'],
                'confidence': result['confidence'],
                'treatment': treatment,
                'pathogen': disease_info['pathogen'] if disease_info else None
            }
        })
    except Exception as e:
        print(f"[SCAN] Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# --- Business Advisor Routes ---
@app.route('/api/business-advisor/init', methods=['POST'])
@require_auth
def init_advisor():
    try:
        data = request.json
        name = data.get('name', 'Farmer')
        print(f"[ADVISOR] Init -> Farmer: {name}")
        
        profile = FarmerProfile(
            name=name,
            land_size=float(data.get('land_size', 5)),
            capital=float(data.get('capital', 100000)),
            market_access=data.get('market_access', 'moderate'),
            skills=data.get('skills', []),
            risk_level=data.get('risk_level', 'medium'),
            time_availability=data.get('time_availability', 'full-time'),
            experience_years=int(data.get('experience_years', 0)),
            language=data.get('language', 'english').lower(),
            selling_preference=data.get('selling_preference'),
            recovery_timeline=data.get('recovery_timeline'),
            loss_tolerance=data.get('loss_tolerance'),
            risk_preference=data.get('risk_preference'),
            age=data.get('age'),
            role=data.get('role', 'farmer'),
            state=data.get('state'),
            district=data.get('district'),
            village=data.get('village'),
            soil_type=data.get('soil_type'),
            water_availability=data.get('water_availability'),
            crops_grown=data.get('crops_grown', []),
            land_unit=data.get('land_unit', 'acres')
        )
        
        import uuid
        session_id = str(uuid.uuid4())
        advisor = KrishiSaarthiAdvisor(profile)
        advisor_sessions[session_id] = advisor
        
        try:
            recommendations = advisor.generate_recommendations()
        except Exception as rec_err:
             recommendations = advisor._get_fallback_recommendations()
        
        print(f"[ADVISOR] Success -> Session: {session_id[:8]}... ({len(recommendations)} recs)")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'recommendations': recommendations,
            'message': 'Business advisor initialized successfully'
        })
    except Exception as e:
        print(f"[ADVISOR] Init Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/chat', methods=['POST'])
@require_auth
def chat_advisor_api():
    try:
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')
        
        if not session_id or session_id not in advisor_sessions:
            return jsonify({'error': 'Invalid session_id'}), 404
        if not message:
            return jsonify({'error': 'message is required'}), 400
            
        advisor = advisor_sessions[session_id]
        print(f"[ADVISOR] Chat -> Input: \"{message[:50]}...\"")
        response = advisor.chat(message)
        print(f"[ADVISOR] Success -> Output: \"{response[:50]}...\" ({len(response)} chars)")
        
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        print(f"[ADVISOR] Chat Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/chat/stream', methods=['POST'])
@require_auth
def chat_advisor_stream():
    try:
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')
        
        if not session_id or session_id not in advisor_sessions:
            return jsonify({'error': 'Invalid session_id'}), 400
        if not message:
            return jsonify({'error': 'message is required'}), 400
            
        advisor = advisor_sessions[session_id]
        print(f"[ADVISOR] Stream Chat -> Input: \"{message[:50]}...\"")
        with open("debug.log", "a") as f:
            f.write(f"Stream initiated for session {session_id}\n")
        
        def generate():
            try:
                for i, chunk in enumerate(advisor.stream_chat(message)):
                    if i == 0:
                        with open("debug.log", "a") as f:
                            f.write(f"First chunk yielded for session {session_id}\n")
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                with open("debug.log", "a") as f:
                    f.write(f"Stream completed for session {session_id}\n")
            except Exception as e:
                print(f"[ADVISOR] Generator Error: {e}")
                with open("debug.log", "a") as f:
                    f.write(f"Generator Error: {e}\n")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        response = Response(generate(), mimetype='text/event-stream')
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['X-Accel-Buffering'] = 'no'
        response.headers['Connection'] = 'keep-alive'
        return response
    except Exception as e:
        print(f"[ADVISOR] Stream Chat Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/business-advisor/integrated-advice', methods=['POST'])
@require_auth
def integrated_advice():
    try:
        data = request.json
        session_id = data.get('session_id')
        disease_result = data.get('disease_result')
        
        if not session_id: 
            return jsonify({'error': 'session_id is required'}), 400
        if session_id not in advisor_sessions: 
            return jsonify({'error': 'Invalid session_id'}), 404
        if not disease_result: 
            return jsonify({'error': 'disease_result is required'}), 400
        
        advisor = advisor_sessions[session_id]
        crop = disease_result.get('crop', 'Unknown')
        disease = disease_result.get('disease', 'Unknown')
        severity = disease_result.get('severity', 'medium')
        
        context_message = f"I have detected {disease} disease in my {crop} crop with {severity} severity."
        print(f"[ADVISOR] Integrated Advice -> Disease: {disease} on {crop}")
        
        response = advisor.chat(context_message)
        print(f"[ADVISOR] Integrated Advice Success")
        
        return jsonify({
            'success': True,
            'response': response,
            'disease_context': {'crop': crop, 'disease': disease, 'severity': severity}
        })
    except Exception as e:
        print(f"[ADVISOR] Integrated Advice Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# --- Waste To Value Routes ---
@app.route('/api/waste-to-value/analyze', methods=['POST'])
@require_auth
def analyze_waste():
    try:
        data = request.json
        crop = data.get('crop')
        language = data.get('language', 'English')
        print(f"[WASTE] Analyze -> Crop: {crop}, Lang: {language}")
        
        if not crop:
            return jsonify({'error': 'Crop name is required'}), 400
        
        if waste_engine is None:
            return jsonify({'error': 'Waste-to-Value service is currently unavailable.'}), 503
        
        result = waste_engine.analyze_waste(crop, language)
        print(f"[WASTE] Success -> Result: {result.get('conclusion', {}).get('title', 'N/A')}")
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        print(f"[WASTE] Analyze Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/waste-to-value/chat', methods=['POST'])
@require_auth
def chat_waste_api():
    try:
        data = request.json
        context = data.get('context')
        question = data.get('question')
        language = data.get('language', 'English')
        
        print(f"[WASTE] Chat -> Question: \"{question[:50]}...\"")
        
        if not context or not question:
            return jsonify({'error': 'Context and question are required'}), 400
        
        if waste_engine is None:
            return jsonify({'error': 'Waste-to-Value service is currently unavailable.'}), 503
        
        response = waste_engine.chat_waste(context, question, language)
        print(f"[WASTE] Success -> Response Length: {len(response)} chars")
        
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        print(f"[WASTE] Chat Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/waste-to-value/chat/stream', methods=['POST'])
@require_auth
def chat_waste_stream():
    try:
        data = request.json
        context = data.get('context')
        question = data.get('question')
        language = data.get('language', 'English')
        
        print(f"[WASTE] Stream Chat -> Question: \"{question[:50]}...\"")
        
        if not context or not question:
            return jsonify({'error': 'Context and question are required'}), 400
        
        if waste_engine is None:
            return jsonify({'error': 'Waste-to-Value service is currently unavailable.'}), 503
        
        def generate():
            try:
                for chunk in waste_engine.stream_chat_waste(context, question, language):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            except Exception as e:
                print(f"[WASTE] Generator Error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        response = Response(generate(), mimetype='text/event-stream')
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['X-Accel-Buffering'] = 'no'
        response.headers['Connection'] = 'keep-alive'
        return response
    except Exception as e:
        print(f"[WASTE] Stream Chat Error: {e}")
        return jsonify({'error': str(e)}), 500

# --- 5-10 Year Roadmap Routes ---
# Lazy load to avoid circular dependencies if any
from services.five_to_ten_year_plan.roadmap_service import SustainabilityRoadmapGenerator
roadmap_generator = SustainabilityRoadmapGenerator()

@app.route('/api/generate-roadmap', methods=['POST'])
@require_auth
def generate_roadmap():
    try:
        data = request.json
        user_id = request.user.get('uid') # Extracted from token by require_auth decorator
        
        # If testing with bypass, we might not have uid in token, fallback to body or error
        if not user_id and os.getenv("FLASK_ENV") == "development":
             user_id = data.get('user_id', 'test_user')

        business_name = data.get('business_name') or data.get('selected_business_name')
        
        if not business_name:
            return jsonify({'error': 'Business name is required'}), 400
            
        print(f"[ROADMAP] Generating for User: {user_id}, Business: {business_name}")
        
        roadmap = roadmap_generator.generate_roadmap(user_id, business_name)
        
        return jsonify({'success': True, 'roadmap': roadmap})

    except Exception as e:
        print(f"[ROADMAP] Generation Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# --- Weather & News Services ---
from services.WeatherNewsIntegration.weather_service import WeatherService
from services.WeatherNewsIntegration.news_service import NewsService

weather_service = WeatherService()
news_service = NewsService()

@app.route('/api/news/<user_id>', methods=['GET', 'OPTIONS'])
@require_auth
def get_personalized_news(user_id):
    try:
        # Verify user_id matches token (optional, but good practice)
        if request.user.get('uid') != user_id and os.getenv("FLASK_ENV") != "development":
             return jsonify({'error': 'Unauthorized access to this user profile'}), 403

        # Fetch user profile from Firebase to get crops/location
        crops = []
        location = "India"
        
        try:
            db = firebase_admin.firestore.client()
            user_doc = db.collection('users').document(user_id).get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Frontend uses 'mainCrops', but some older data might have 'crops'
                crops = user_data.get('mainCrops') or user_data.get('crops', [])
                
                # Construct best possible location string
                district = user_data.get('district')
                state = user_data.get('state')
                
                if district and state:
                   location = f"{district}, {state}"
                elif district:
                   location = district
                else:
                   location = user_data.get('location') or "India"
            else:
                print(f"[NEWS] User {user_id} not found in Firestore. Using defaults.")
        except Exception as db_err:
            print(f"[NEWS] Firestore Error (Using defaults): {db_err}")
            
        print(f"[NEWS] Fetching for {user_id} (Crops: {crops}, Loc: {location})")
        
        # Async call wrapper
        import asyncio
        news = asyncio.run(news_service.get_personalized_news(crops, location))
        
        return jsonify({'success': True, 'news': news})
    except Exception as e:
        print(f"[NEWS] Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather/current', methods=['GET', 'OPTIONS'])
@require_auth
def get_current_weather():
    try:
        location = request.args.get('location', 'India')
        import asyncio
        weather = asyncio.run(weather_service.get_weather(location))
        return jsonify({'success': True, 'weather': weather})
    except Exception as e:
        print(f"[WEATHER] Error: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    print("Starting server with ALL components...")
    print("\n=== Registered Routes ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} {list(rule.methods)}")
    print("=========================\n")
    app.run(port=5000)

