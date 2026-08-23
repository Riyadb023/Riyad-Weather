export function getWeatherIcon(code, iconId = "01d") {
  const isNight = iconId.endsWith("n");

  // OpenWeather condition codes mapping
  if (code >= 200 && code < 300) return "⛈️"; // Thunderstorm
  if (code >= 300 && code < 400) return "🌦️"; // Drizzle
  if (code >= 500 && code < 600) return "🌧️"; // Rain
  if (code >= 600 && code < 700) return "❄️"; // Snow
  if (code >= 700 && code < 800) return "🌫️"; // Atmosphere (Mist, Fog, Smoke)
  if (code === 800) return isNight ? "🌙" : "☀️"; // Clear Sky
  if (code === 801 || code === 802) return isNight ? "☁️" : "🌤️"; // Few/Scattered clouds
  if (code >= 803) return "☁️"; // Broken/Overcast clouds

  return "🌤️";
}
