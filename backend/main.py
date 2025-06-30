from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

WAQI_TOKEN = "9b92db00ba4e949dca3234f7ee25d4a45de37adb"

cities = [
    {"name": "Delhi", "lat": 28.6139, "lon": 77.209},
    {"name": "Mumbai", "lat": 19.076, "lon": 72.8777},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
    {"name": "Hyderabad", "lat": 17.385, "lon": 78.4867}
]

# Load model once
model = joblib.load("aqi_model.pkl")

def get_aqi(city):
    try:
        url = f"https://api.waqi.info/feed/{city['name']}/?token={WAQI_TOKEN}"
        res = requests.get(url)
        data = res.json()
        
        if data.get("status") == "ok":
            aqi = data["data"].get("aqi", 100)
            return {
                "city": city["name"],
                "lat": city["lat"],
                "lon": city["lon"],
                "aqi": aqi
            }
    except Exception as e:
        print(f"Error for {city['name']}: {e}")
    
    return {
        "city": city["name"],
        "lat": city["lat"],
        "lon": city["lon"],
        "aqi": 100
    }

@app.route('/api/aqi')
def api_aqi():
    data = [get_aqi(city) for city in cities]
    return jsonify(data)

@app.route('/api/top-cities')
def api_top_cities():
    data = [get_aqi(city) for city in cities]
    sorted_data = sorted(data, key=lambda x: x["aqi"], reverse=True)
    return jsonify(sorted_data[:3])

@app.route('/api/aqi-trend')
def aqi_trend():
    trend = []
    base = get_aqi({"name": "Delhi", "lat": 28.6139, "lon": 77.2090})["aqi"]
    for h in range(12):
        trend.append({"time": f"{h}:00", "aqi": base + ((h % 5) * 4)})
    return jsonify(trend)

@app.route('/api/predict', methods=['POST'])
def predict_aqi():
    data = request.json
    city = data.get("city")
    lat = data.get("lat")
    lon = data.get("lon")

    if not all([city, lat, lon]):
        return jsonify({"error": "city, lat, lon required"}), 400

    # 🛰️ Fetch real-time weather data
    try:
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=1a2576a4b84bfb2012c4297ed23dbdd9&units=metric"

        res = requests.get(weather_url)
        weather = res.json()

        temp = weather["main"]["temp"]
        humidity = weather["main"]["humidity"]
        pressure = weather["main"]["pressure"]
    except Exception as e:
        return jsonify({"error": f"Weather fetch failed: {str(e)}"}), 500

    # 🔎 City One-Hot Encoding
    cities_list = ['Ahmedabad', 'Bengaluru', 'Bhopal', 'Chandigarh', 'Chennai', 'Delhi',
                   'Hyderabad', 'Indore', 'Jaipur', 'Kolkata', 'Lucknow', 'Mumbai',
                   'Nagpur', 'Patna', 'Pune']
    city_features = [1 if c == city else 0 for c in cities_list]

    # 🤖 Prediction
    features = [lat, lon, temp, humidity, pressure] + city_features
    predicted_aqi = model.predict([features])[0]

    return jsonify({
        "predicted_aqi": round(predicted_aqi),
        "city": city,
        "temp": temp,
        "humidity": humidity,
        "pressure": pressure
    })
@app.route('/api/insights')
def ai_insights():
    # You can dynamically generate or update this list from your ML model in the future
    insights = [
        "🔍 High AQI in Kolkata today. Authorities should issue health advisories.",
        "🌡️ Temperatures in Delhi might aggravate PM2.5 concentration.",
        "📈 AQI in Mumbai has improved due to recent rains.",
        "💡 Hyderabad's air remains moderate—ideal conditions for outdoor activities.",
        "🚨 Patna and Kolkata show signs of sustained pollution. Long-term measures advised."
    ]
    return jsonify(insights)
if __name__ == '__main__':
    from os import environ
    port = int(environ.get('PORT',5000))
    app.run(debug=True, host='0.0.0.0',port=port)
