export function formatTemperature(tempCelsius, unit = "celsius") {
  if (tempCelsius === null || tempCelsius === undefined) return "--";

  if (unit === "fahrenheit") {
    const fahrenheit = (tempCelsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }

  return `${Math.round(tempCelsius)}°C`;
}
