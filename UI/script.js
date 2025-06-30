// 1️⃣ Create Base Layers
const baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
});

const cloudOverlay = L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=1a2576a4b84bfb2012c4297ed23dbdd9&units=metric', {
  opacity: 0.5,
  attribution: '☁️ Clouds © OpenWeatherMap'
});

const map = L.map('india-map', {
  center: [22.9734, 78.6569],
  zoom: 5,
  layers: [baseMap]
});

L.control.layers(
  {
    "🗺️ Map": baseMap,
    "🛰️ Satellite": satelliteMap
  },
  {
    "☁️ Cloud Overlay": cloudOverlay
  }
).addTo(map);

// 🔵 AQI Markers
function getColor(aqi) {
  return aqi <= 50 ? '#2DC937' :
         aqi <= 100 ? '#E7B416' :
         aqi <= 150 ? '#DB7B2B' :
         aqi <= 200 ? '#CC3232' :
         aqi <= 300 ? '#4E0685' :
                      '#000000';
}

function createAQIMarker(city) {
  const icon = L.divIcon({
    className: '',
    html: `<div style="background:${getColor(city.aqi)};color:white;padding:4px 6px;border-radius:4px;font-size:12px;font-weight:bold;text-align:center;box-shadow:0 0 4px rgba(0,0,0,0.5);">${city.aqi}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  
  return L.marker([city.lat, city.lon], {
  icon: icon,
  riseOnHover: true,
  riseOffset: 250
}).bindPopup(`<strong>${city.city}</strong><br>AQI: ${city.aqi}`);

}

// 🔁 Render Live AQI
// 👇 Render backend se AQI data fetch kar raha hai
fetch("https://airwatch-india-backend.onrender.com/api/aqi")  // ✅ Replace with your backend URL
  .then(res => res.json())
  .then(data => {
    console.log("AQI DATA:", data);  // ✅ Check Console mein output aa raha

    const container = document.getElementById("aqi-data");

    // Sab data show kar do
    container.innerHTML = data.map(city => `
      <div class="city-box">
        <h2>${city.city}</h2>
        <p><strong>AQI:</strong> ${city.aqi}</p>
      </div>
    `).join("");
  })
  .catch(err => {
    console.error("API Error:", err);
  });

// 📊 Charts
async function updateAQICharts() {
  try {
    const topRes = await fetch("https://airwatch-india-backend.onrender.com/api/top-cities");
    const topData = await topRes.json();

    const topCtx = document.getElementById("topCitiesChart").getContext("2d");
    if (window.topChart) window.topChart.destroy();
    window.topChart = new Chart(topCtx, {
      type: 'bar',
      data: {
        labels: topData.map(c => c.city),
        datasets: [{
          label: 'AQI',
          data: topData.map(c => c.aqi),
          backgroundColor: '#CC3232'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Top 3 Polluted Cities (Live)' }
        }
      }
    });

    const trendRes = await fetch("https://airwatch-india-backend.onrender.com/api/aqi-trend");
    const trendData = await trendRes.json();
    const trendCtx = document.getElementById("aqiTrendChart").getContext("2d");
    if (window.trendChart) window.trendChart.destroy();
    window.trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: trendData.map(d => d.time),
        datasets: [{
          label: 'Delhi AQI',
          data: trendData.map(d => d.aqi),
          borderColor: '#4E0685',
          backgroundColor: 'rgba(78,6,133,0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Delhi AQI Trend (Last 12 Hours)' }
        }
      }
    });

  } catch (err) {
    console.error("Chart rendering failed:", err);
  }
}

// ✅ Download CSV
function downloadCSV() {
  if (!window.latestAqiData) return alert("❌ No data available yet!");

  const csv = [
    ["City", "Latitude", "Longitude", "AQI"],
    ...window.latestAqiData.map(d => [d.city, d.lat, d.lon, d.aqi])
  ]
    .map(row => row.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aqi_report.csv";
  a.click();
}

setInterval(updateAQICharts, 300000); // every 5 minutes
updateAQICharts();
renderLiveAQI();


// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDPnaME7CEjFnJGuTwcIgBJOOWYi4WdJsk",
  authDomain: "airwatch-india.firebaseapp.com",
  projectId: "airwatch-india",
  storageBucket: "airwatch-india.appspot.com",
  messagingSenderId: "379211073462",
  appId: "1:379211073462:web:a0115ab922c76a22d72317"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 🔓 Show login popup on load
window.addEventListener("load", () => {
  document.getElementById("authPopup").classList.remove("hidden");
});

// ❌ Close Popup
function closeAuthPopup() {
  document.getElementById("authPopup").classList.add("hidden");
}

// 🔑 Login
function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("✅ Logged in!");
      closeAuthPopup();
    })
    .catch(error => {
      alert("❌ Login failed: " + error.message);
    });
}

// ✅ Signup
function signupUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("✅ Registered successfully!");
      closeAuthPopup();
    })
    .catch(error => {
      alert("❌ Signup failed: " + error.message);
    });
}
window.addEventListener("load", () => {
  const popup = document.getElementById("authPopup");
  popup.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // disable scroll
});

// Re-enable scrolling when closed
function closeAuthPopup() {
  document.getElementById("authPopup").classList.add("hidden");
  document.body.style.overflow = "auto"; // re-enable scroll
}
