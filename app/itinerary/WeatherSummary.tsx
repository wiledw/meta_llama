import React, { useEffect, useState } from "react";

interface WeatherProps {
  lat: number;
  lng: number;
  date: string; // Format: "YYYY-MM-DD"
}

interface WeatherData {
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

const WEATHER_CODES: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle: Light",
  53: "Drizzle: Moderate",
  55: "Drizzle: Dense",
  61: "Rain: Slight",
  63: "Rain: Moderate",
  65: "Rain: Heavy",
  71: "Snow fall: Slight",
  73: "Snow fall: Moderate",
  75: "Snow fall: Heavy",
  95: "Thunderstorm",
};

const WeatherSummary: React.FC<WeatherProps> = ({ lat, lng, date }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        const data = await response.json();

        const index = data.daily.time.findIndex(
          (time: string) => time === date
        );
        if (index !== -1) {
          setWeather({
            maxTemp: data.daily.temperature_2m_max[index],
            minTemp: data.daily.temperature_2m_min[index],
            weatherCode: data.daily.weathercode[index],
          });
        } else {
          setError("Weather data not available for the selected date.");
        }
      } catch (error) {
        setError("Failed to fetch weather data.");
      }
    };

    fetchWeather();
  }, [lat, lng, date]);

  if (error) {
    return <p className="text-sm text-red-500 text-center">{error}</p>;
  }

  if (!weather) {
    return (
      <p className="text-sm text-gray-500 text-center">Loading weather...</p>
    );
  }

  const weatherDescription =
    WEATHER_CODES[weather.weatherCode] || "Unknown weather condition";

  return (
    <div className="text-center p-4 rounded-md">
      <h2 className="text-center text-lg text-black-500 mt-2">
        {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}
      </h2>
      <p className="text-sm text-gray-600">
        Max Temp: {weather.maxTemp}°C | Min Temp: {weather.minTemp}°C
      </p>
      <p className="text-sm text-gray-600">{weatherDescription}</p>
    </div>
  );
};

export default WeatherSummary;
