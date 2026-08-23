// src/main.js
import "./style.css";
import { searchCity, reverseGeocode } from "./api/geocodingApi.js";
import { getWeatherData } from "./api/weatherApi.js";
import {
  transformCurrentWeather,
  transformForecast,
} from "./utils/transformWeather.js";
import { formatTemperature } from "./utils/formatTemperature.js";
import { formatTime } from "./utils/formatTime.js";
import { formatDate } from "./utils/formatDate.js";
import { getWeatherIcon } from "./utils/weatherIcons.js";
import {
  state,
  setUnit,
  setWeatherData,
  toggleFavorite,
  isFavorite,
} from "./state/appState.js";

// DOM Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("city-search");
const statusContainer = document.getElementById("status-container");
const dashboard = document.getElementById("weather-dashboard");
const toggleC = document.getElementById("toggle-c");
const toggleF = document.getElementById("toggle-f");
const locationBtn = document.getElementById("location-btn");
const favBtn = document.getElementById("fav-btn");
const favoritesBar = document.getElementById("favorites-bar");

// UI Render Helpers
function showStatus(message, isError = false) {
  if (!message) {
    statusContainer.innerHTML = "";
    return;
  }
  statusContainer.innerHTML = `
    <div class="status-msg ${isError ? "status-error" : "status-loading"}">
      ${message}
    </div>
  `;
}

function updateUnitToggleButtons() {
  if (state.unit === "celsius") {
    toggleC.classList.add("active");
    toggleC.setAttribute("aria-pressed", "true");
    toggleF.classList.remove("active");
    toggleF.setAttribute("aria-pressed", "false");
  } else {
    toggleF.classList.add("active");
    toggleF.setAttribute("aria-pressed", "true");
    toggleC.classList.remove("active");
    toggleC.setAttribute("aria-pressed", "false");
  }
}

function renderFavorites() {
  favoritesBar.innerHTML = "";
  if (state.favorites.length === 0) {
    favoritesBar.classList.add("hidden");
    return;
  }
  favoritesBar.classList.remove("hidden");

  state.favorites.forEach((fav) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "fav-chip";
    chip.textContent = `📍 ${fav.name}`;
    chip.addEventListener("click", () => loadCityWeather(fav.name));
    favoritesBar.appendChild(chip);
  });
}

function renderWeather() {
  if (!state.currentWeather || !state.forecast || !state.location) return;

  const current = state.currentWeather;
  const forecast = state.forecast;

  // Header & Status
  document.getElementById("location-name").textContent =
    `${state.location.name}, ${state.location.country}`;
  document.getElementById("weather-desc").textContent = current.description;
  document.getElementById("current-icon").textContent = getWeatherIcon(
    current.weatherId,
    current.icon,
  );

  // Current Temp
  document.getElementById("current-temp").textContent = formatTemperature(
    current.temp,
    state.unit,
  );
  document.getElementById("feels-like").textContent =
    `Feels like ${formatTemperature(current.feelsLike, state.unit)}`;

  // Favorite Star State
  const activeFav = isFavorite(state.location);
  favBtn.classList.toggle("active", activeFav);
  favBtn.setAttribute(
    "aria-label",
    activeFav ? "Remove from favorites" : "Add to favorites",
  );

  // Details Grid
  document.getElementById("detail-humidity").textContent =
    `${current.humidity}%`;
  document.getElementById("detail-wind").textContent =
    `${current.windSpeed} km/h`;
  document.getElementById("detail-pressure").textContent =
    `${current.pressure} hPa`;
  document.getElementById("detail-visibility").textContent =
    `${current.visibility} km`;

  // Hourly List
  const hourlyContainer = document.getElementById("hourly-list");
  hourlyContainer.innerHTML = forecast.hourly
    .map(
      (item) => `
    <div class="forecast-item hourly-item">
      <span class="forecast-time">${formatTime(item.time)}</span>
      <span class="forecast-icon">${getWeatherIcon(item.weatherId, item.icon)}</span>
      <span class="forecast-temp">${formatTemperature(item.temp, state.unit)}</span>
    </div>
  `,
    )
    .join("");

  // Daily List
  const dailyContainer = document.getElementById("daily-list");
  dailyContainer.innerHTML = forecast.daily
    .map(
      (item) => `
    <div class="forecast-item daily-item">
      <span class="forecast-date">${formatDate(item.date)}</span>
      <div class="daily-mid">
        <span class="forecast-icon">${getWeatherIcon(item.weatherId, item.icon)}</span>
        <span class="daily-desc">${item.description}</span>
      </div>
      <div class="daily-temps">
        <span class="temp-high">${formatTemperature(item.tempMax, state.unit)}</span>
        <span class="temp-low">${formatTemperature(item.tempMin, state.unit)}</span>
      </div>
    </div>
  `,
    )
    .join("");

  dashboard.classList.remove("hidden");
  showStatus(null);
  updateWeatherBackground();
}
// Maps OpenWeather's "main" condition field to one of our sky classes.
// (Fog/Mist/Haze/Smoke/Dust/Sand/Ash/Squall/Tornado all share one calm,
// hazy "atmosphere" treatment — they're visually similar low-contrast skies.)
function getWeatherClass(condition, isNight) {
  const key = condition.toLowerCase();

  if (key === "clear")
    return isNight ? "weather-clear-night" : "weather-clear-day";
  if (key === "clouds")
    return isNight ? "weather-clouds-night" : "weather-clouds-day";
  if (key === "drizzle" || key === "rain") return "weather-rain";
  if (key === "thunderstorm") return "weather-thunderstorm";
  if (key === "snow") return "weather-snow";
  return "weather-atmosphere"; // mist, fog, haze, smoke, dust, sand, ash, squall, tornado
}

function updateWeatherBackground() {
  if (!state.currentWeather) return;

  const body = document.body;
  const isNight = state.currentWeather.icon.endsWith("n");
  const nextClass = getWeatherClass(state.currentWeather.condition, isNight);

  if (body.dataset.sky === nextClass) return; // avoid restarting animations needlessly
  body.dataset.sky = nextClass;

  body.className = body.className.replace(/weather-\S+/g, "").trim();
  body.classList.add(nextClass);
}

// Controller Actions
async function loadCityWeather(cityName) {
  showStatus(`Fetching weather for "${cityName}"...`);
  dashboard.classList.add("hidden");

  try {
    const location = await searchCity(cityName);
    const rawData = await getWeatherData(location.lat, location.lon);

    const current = transformCurrentWeather(rawData.current, location);
    const forecast = transformForecast(rawData.forecast);

    setWeatherData(location, current, forecast);
    renderWeather();
    renderFavorites();
  } catch (err) {
    showStatus(err.message || "Error loading weather data.", true);
  }
}

async function loadCoordsWeather(lat, lon) {
  showStatus("Detecting location and fetching weather...");
  dashboard.classList.add("hidden");

  try {
    const location = await reverseGeocode(lat, lon);
    const rawData = await getWeatherData(lat, lon);

    const current = transformCurrentWeather(rawData.current, location);
    const forecast = transformForecast(rawData.forecast);

    setWeatherData(location, current, forecast);
    renderWeather();
    renderFavorites();
  } catch (err) {
    showStatus(
      err.message || "Unable to fetch weather for your location.",
      true,
    );
  }
}

// Event Listeners
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    loadCityWeather(query);
    searchInput.value = "";
  }
});

toggleC.addEventListener("click", () => {
  if (state.unit !== "celsius") {
    setUnit("celsius");
    updateUnitToggleButtons();
    renderWeather();
  }
});

toggleF.addEventListener("click", () => {
  if (state.unit !== "fahrenheit") {
    setUnit("fahrenheit");
    updateUnitToggleButtons();
    renderWeather();
  }
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showStatus("Geolocation is not supported by your browser.", true);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => loadCoordsWeather(pos.coords.latitude, pos.coords.longitude),
    () =>
      showStatus("Location access denied. Search for a city manually.", true),
  );
});

favBtn.addEventListener("click", () => {
  if (!state.location) return;
  toggleFavorite(state.location);
  favBtn.classList.toggle("active", isFavorite(state.location));
  renderFavorites();
});

// App Entry Point
function initApp() {
  updateUnitToggleButtons();
  renderFavorites();
  loadCityWeather(state.lastCity || "Algiers");
}

initApp();
