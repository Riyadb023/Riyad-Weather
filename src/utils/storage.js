const KEYS = {
  FAVORITES: "riyad_weather_favorites",
  UNIT: "riyad_weather_unit",
  LAST_CITY: "riyad_weather_last_city",
};

export function loadSettings() {
  try {
    return {
      favorites: JSON.parse(localStorage.getItem(KEYS.FAVORITES)) || [],
      unit: localStorage.getItem(KEYS.UNIT) || "celsius",
      lastCity: localStorage.getItem(KEYS.LAST_CITY) || "Algiers",
    };
  } catch {
    return { favorites: [], unit: "celsius", lastCity: "Algiers" };
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
}

export function saveUnit(unit) {
  localStorage.setItem(KEYS.UNIT, unit);
}

export function saveLastCity(city) {
  localStorage.setItem(KEYS.LAST_CITY, city);
}
