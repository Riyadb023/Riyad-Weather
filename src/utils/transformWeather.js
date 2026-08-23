// src/utils/transformWeather.js

export function transformCurrentWeather(rawCurrent, location) {
  return {
    city: location.name,
    country: location.country,
    temp: Math.round(rawCurrent.main.temp),
    feelsLike: Math.round(rawCurrent.main.feels_like),
    humidity: rawCurrent.main.humidity,
    pressure: rawCurrent.main.pressure,
    windSpeed: Math.round(rawCurrent.wind.speed * 3.6),
    visibility: Math.round(rawCurrent.visibility / 1000),
    condition: rawCurrent.weather[0].main,
    description: rawCurrent.weather[0].description,
    weatherId: rawCurrent.weather[0].id,
    icon: rawCurrent.weather[0].icon,
    dt: rawCurrent.dt,
  };
}

export function transformForecast(rawForecast) {
  const hourly = rawForecast.list.slice(0, 8).map((item) => ({
    time: item.dt_txt,
    temp: Math.round(item.main.temp),
    weatherId: item.weather[0].id,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
  }));

  const dailyMap = new Map();
  rawForecast.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap.has(date) || item.dt_txt.includes("12:00:00")) {
      dailyMap.set(date, item);
    }
  });

  const daily = Array.from(dailyMap.values())
    .slice(0, 5)
    .map((item) => ({
      date: item.dt_txt.split(" ")[0],
      temp: Math.round(item.main.temp),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      weatherId: item.weather[0].id,
      icon: item.weather[0].icon,
      description: item.weather[0].description,
    }));

  return { hourly, daily };
}
