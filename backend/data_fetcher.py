import requests

def get_india_aqi_data():
    url = "https://api.waqi.info/map/bounds/?latlng=6,68,37,97&token=9b92db00ba4e949dca3234f7ee25d4a45de37adb"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        locations = []
        for city in data.get("data", []):
            locations.append({
                "city": city.get("station", {}).get("name", "Unknown"),
                "aqi": city.get("aqi", "-"),
                "lat": city.get("lat"),
                "lon": city.get("lon")
            })
        return locations
    return []

