// src/api/geocodingApi.js

export async function searchCity(cityName) {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to contact the location service.");

  const data = await response.json();
  if (data.length === 0)
    throw new Error("City not found. Please check your spelling.");

  const result = data[0];
  return {
    name: result.name,
    lat: result.lat,
    lon: result.lon,
    country: result.country,
    state: result.state || "",
  };
}

export async function reverseGeocode(lat, lon) {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to resolve current location.");

  const data = await response.json();
  if (!data || data.length === 0) {
    return { name: "Current Location", country: "", lat, lon };
  }

  return {
    name: data[0].name,
    lat,
    lon,
    country: data[0].country,
  };
}
