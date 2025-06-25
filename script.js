
// Chart.js setup
const ctx = document.getElementById('aqiChart').getContext('2d');
const aqiChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Delhi', 'Mumbai', 'Lucknow'],
    datasets: [{
      label: 'AQI Levels',
      data: [310, 97, 189],
      backgroundColor: 'rgba(0, 255, 255, 0.2)',
      borderColor: '#00ffff',
      borderWidth: 2,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' }
      },
      x: {
        ticks: { color: '#fff' }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      }
    }
  }
});

// Leaflet map setup
const map = L.map('map').setView([28.6139, 77.2090], 5); // India center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const cities = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090, aqi: 310 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, aqi: 97 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462, aqi: 189 }
];

cities.forEach(city => {
  const color = city.aqi < 50 ? "green" : city.aqi < 100 ? "orange" : "red";
  L.circleMarker([city.lat, city.lon], {
    radius: 10,
    color: color,
    fillOpacity: 0.5
  }).addTo(map).bindPopup(`<b>${city.name}</b><br>AQI: ${city.aqi}`);
});
