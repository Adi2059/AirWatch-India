import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

# Original data
data = {
    'city': ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Pune',
             'Bhopal', 'Patna', 'Nagpur', 'Indore', 'Chandigarh'],
    'lat': [28.6139, 19.076, 12.9716, 13.0827, 17.385, 22.5726, 23.0225, 26.9124, 26.8467, 18.5204,
            23.2599, 25.5941, 21.1458, 22.7196, 30.7333],
    'lon': [77.209, 72.8777, 77.5946, 80.2707, 78.4867, 88.3639, 72.5714, 75.7873, 80.9462, 73.8567,
            77.4126, 85.1376, 79.0882, 75.8577, 76.7794],
    'aqi': [159, 121, 71, 72, 72, 169, 49, 63, 53, 59, 38, 138, 52, 83, 87],
    'temp': [25]*15,
    'humidity': [50]*15,
    'pressure': [1010]*15
}

df = pd.DataFrame(data)

# One-hot encode city
df_encoded = pd.get_dummies(df, columns=['city'])

# Features and target
X = df_encoded.drop('aqi', axis=1)
y = df_encoded['aqi']

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"✅ Model Trained. MAE: {mae:.2f}")

# Save Model
joblib.dump(model, 'aqi_model.pkl')
print("✅ Model saved as aqi_model.pkl")
