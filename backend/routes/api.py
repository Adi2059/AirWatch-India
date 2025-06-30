import requests
from flask import Blueprint, jsonify

api_bp = Blueprint('api', __name__)

@api_bp.route('/get-aqi/<city>', methods=['GET'])
def get_aqi(city):
    try:
        url = f"https://api.openaq.org/v2/latest?city={city.capitalize()}"
        response = requests.get(url)
        data = response.json()

        aqi = data['results'][0]['measurements'][0]['value']
        return jsonify({"city": city, "aqi": aqi})
    except:
        return jsonify({"city": city, "aqi": "N/A", "error": "No AQI data"}), 404
