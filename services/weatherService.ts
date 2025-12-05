import { WeatherData } from '../types';

// Coordinates for Guliston, Sirdaryo
const LAT = 40.49;
const LON = 68.78;

const getWeatherCondition = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return "Ochiq havo ☀️";
  if (code === 1 || code === 2 || code === 3) return "Yengil bulutli 🌤";
  if (code === 45 || code === 48) return "Tumanli 🌫";
  if (code >= 51 && code <= 55) return "Yengil yomg‘ir 🌦";
  if (code >= 61 && code <= 65) return "Yomg‘ir 🌧";
  if (code >= 71 && code <= 77) return "Qor ❄️";
  if (code >= 80 && code <= 82) return "Jala 🌧";
  if (code >= 95) return "Momaqaldiroq ⛈";
  return "O‘zgaruvchan havo 🌥";
};

export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("Ob-havo ma'lumotlarini yuklashda xatolik");
    }

    const data = await response.json();
    const current = data.current;

    const weatherData: WeatherData = {
      temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      rainProb: current.precipitation, // OpenMeteo gives current precip in mm, approximating probability logic or just usage
      condition: getWeatherCondition(current.weather_code),
      originalText: "" // Will be formatted below
    };

    // Construct the formatted string immediately for consistency
    const rainText = weatherData.rainProb > 0 ? `Yog‘ingarchilik: ${weatherData.rainProb}mm` : "Yog‘ingarchilik ehtimoli past";
    
    weatherData.originalText = `🌤 **Sirdaryo viloyati ob-havosi:**\n\n🌡 Harorat: ${weatherData.temp}°C\n💧 Namlik: ${weatherData.humidity}%\n💨 Shamol: ${weatherData.windSpeed} m/s\n☔️ ${rainText}\n☁️ Holat: ${weatherData.condition}\n\n@magistr_guliston sahifasini kuzatishda davom eting!`;

    return weatherData;
  } catch (error) {
    console.error("Weather fetch error:", error);
    throw error;
  }
};
