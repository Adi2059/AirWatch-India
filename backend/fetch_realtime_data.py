import requests
import json
import csv

WAQI_TOKEN = "9b92db00ba4e949dca3234f7ee25d4a45de37adb"

cities = [
    {"name": "Delhi", "lat": 28.6139, "lon": 77.209},
    {"name": "Mumbai", "lat": 19.076, "lon": 72.8777},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
    {"name": "Hyderabad", "lat": 17.385, "lon": 78.4867},
    {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639},
    {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
    {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873},
    {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462},
    {"name": "Pune", "lat": 18.5204, "lon": 73.8567},
    {"name": "Bhopal", "lat": 23.2599, "lon": 77.4126},
    {"name": "Patna", "lat": 25.5941, "lon": 85.1376},
    {"name": "Nagpur", "lat": 21.1458, "lon": 79.0882},
    {"name": "Indore", "lat": 22.7196, "lon": 75.8577},
    {"name": "Chandigarh", "lat": 30.7333, "lon": 76.7794}
]


data_rows = []

for city in cities:
    url = f"https://api.waqi.info/feed/geo:{city['lat']};{city['lon']}/?token={WAQI_TOKEN}"
    try:
        response = requests.get(url)
        result = response.json()

        if result["status"] == "ok":
            aqi = result["data"]["aqi"]
            data_rows.append({
                "city": city["name"],
                "lat": city["lat"],
                "lon": city["lon"],
                "aqi": aqi
            })
            print(f"{city['name']} => AQI: {aqi}")
        else:
            print(f"{city['name']} => Error: {result.get('data')}")

    except Exception as e:
        print(f"{city['name']} => Exception: {e}")

# Save to CSV (optional)
with open("realtime_aqi.csv", "w", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=["city", "lat", "lon", "aqi"])
    writer.writeheader()
    writer.writerows(data_rows)

print("✅ Realtime data saved to realtime_aqi.csv")
