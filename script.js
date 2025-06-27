// script.js

async function fetchAQIData() {
  const url = 'https://api.openaq.org/v2/latest?country_id=IN&limit=100';
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    const cities = {};
    data.results.forEach(result => {
      const city = result.city;
      const pm25 = result.measurements.find(m => m.parameter === 'pm25');
      const coordinates = result.coordinates;
      if (pm25 && coordinates && !cities[city]) {
        cities[city] = {
          aqi: pm25.value,
          lat: coordinates.latitude,
          lon: coordinates.longitude
        };
      }
    });

    const citySection = document.querySelector(".city-section");
    const loading = document.getElementById("loading-msg");
    loading.style.display = "block";

    citySection.innerHTML = "";
    Object.keys(cities).slice(0, 12).forEach(city => {
      const aqi = cities[city].aqi;
      const card = document.createElement("div");
      card.className = "city-card";
      card.innerHTML = `
        <h2>${city}</h2>
        <p class="aqi">AQI: ${aqi}</p>
        <p class="status"></p>
      `;
      citySection.appendChild(card);
    });

    loading.style.display = "none";
    updateAQIStatus();

    const cityList = Object.keys(cities).map(name => ({
      name,
      aqi: cities[name].aqi,
      lat: cities[name].lat,
      lon: cities[name].lon
    }));
    initMap(cityList);
  } catch (error) {
    console.error("Error fetching AQI data:", error);
  }
}

function updateAQIStatus() {
  const cityCards = document.querySelectorAll(".city-card");

  cityCards.forEach(card => {
    const aqiValue = parseInt(card.querySelector(".aqi").textContent.replace("AQI: ", ""));
    const status = card.querySelector(".status");

    if (aqiValue <= 100) {
      status.textContent = "Good";
      status.classList.add("good");
      card.classList.add("good");
    } else if (aqiValue <= 150) {
      status.textContent = "Moderate";
      status.classList.add("moderate");
      card.classList.add("moderate");
    } else {
      status.textContent = "Unhealthy";
      status.classList.add("unhealthy");
      card.classList.add("unhealthy");
    }
  });
}

function setupSearch() {
  const searchInput = document.querySelector(".nav-right input");
  searchInput.addEventListener("keyup", e => {
    const keyword = e.target.value.toLowerCase();
    document.querySelectorAll(".city-card").forEach(card => {
      const city = card.querySelector("h2").textContent.toLowerCase();
      card.style.display = city.includes(keyword) ? "block" : "none";
    });
  });
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-card h3");
  counters.forEach(counter => {
    let start = 0;
    const end = parseInt(counter.textContent);
    const duration = 2000;
    const increment = end / (duration / 20);

    const update = () => {
      start += increment;
      if (start < end) {
        counter.textContent = Math.floor(start);
        requestAnimationFrame(update);
      } else {
        counter.textContent = end;
      }
    };
    update();
  });
}


