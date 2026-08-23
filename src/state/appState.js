import {
  loadSettings,
  saveFavorites,
  saveUnit,
  saveLastCity,
} from "../utils/storage.js";

const initialSettings = loadSettings();

export const state = {
  unit: initialSettings.unit,
  location: null,
  currentWeather: null,
  forecast: null,
  favorites: initialSettings.favorites,
  lastCity: initialSettings.lastCity,
  isLoading: false,
  error: null,
};

export function setUnit(newUnit) {
  state.unit = newUnit;
  saveUnit(newUnit);
}

export function setWeatherData(location, current, forecast) {
  state.location = location;
  state.currentWeather = current;
  state.forecast = forecast;
  state.lastCity = location.name;
  state.error = null;
  saveLastCity(location.name);
}

export function toggleFavorite(cityObj) {
  const index = state.favorites.findIndex(
    (fav) =>
      fav.name.toLowerCase() === cityObj.name.toLowerCase() &&
      fav.country === cityObj.country,
  );

  if (index >= 0) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(cityObj);
  }
  saveFavorites(state.favorites);
}

export function isFavorite(cityObj) {
  if (!cityObj) return false;
  return state.favorites.some(
    (fav) =>
      fav.name.toLowerCase() === cityObj.name.toLowerCase() &&
      fav.country === cityObj.country,
  );
}
