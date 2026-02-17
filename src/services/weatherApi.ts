const WEATHER_API_KEY = "3af02a9d69a54591b0540255260301";
const BASE_URL = "https://api.weatherapi.com/v1";

export interface WeatherData {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    cloud: number;
    wind_kph: number;
    wind_dir: string;
    condition: {
      text: string;
    };
  };
  forecast?: {
    forecastday: Array<{
      astro: {
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
    }>;
  };
}

export async function fetchWeather(location: string = "London"): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=1&aqi=no`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  const data = await response.json();
  
  // Handle empty current object from API (subscription limitation)
  if (!data.current || Object.keys(data.current).length === 0) {
    // Use forecast data as fallback
    const forecastHour = data.forecast?.forecastday?.[0]?.hour?.[0];
    if (forecastHour) {
      data.current = {
        temp_c: forecastHour.temp_c ?? 0,
        feelslike_c: forecastHour.feelslike_c ?? 0,
        humidity: forecastHour.humidity ?? 0,
        cloud: forecastHour.cloud ?? 0,
        wind_kph: forecastHour.wind_kph ?? 0,
        wind_dir: forecastHour.wind_dir ?? "N/A",
        condition: forecastHour.condition ?? { text: "Unknown" },
      };
    } else {
      // Fallback defaults
      data.current = {
        temp_c: 0,
        feelslike_c: 0,
        humidity: 0,
        cloud: 0,
        wind_kph: 0,
        wind_dir: "N/A",
        condition: { text: "Unknown" },
      };
    }
  }
  
  return data;
}

export function calculateVisibilityScore(weather: WeatherData): number {
  const cloudCover = weather.current.cloud;
  const humidity = weather.current.humidity;
  const wind = weather.current.wind_kph;
  
  // Simple visibility calculation based on weather conditions
  let score = 100;
  score -= cloudCover * 0.8; // Cloud cover has highest impact
  score -= (humidity > 70 ? (humidity - 70) * 0.5 : 0); // High humidity reduces visibility
  score -= (wind > 20 ? (wind - 20) * 0.3 : 0); // High wind can cause turbulence
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getVisibilityStatus(score: number): { status: string; description: string } {
  if (score >= 80) {
    return {
      status: "Excellent Visibility",
      description: "Perfect conditions for deep-sky observation and astrophotography."
    };
  } else if (score >= 60) {
    return {
      status: "Good Visibility", 
      description: "Good conditions for planetary and lunar observation."
    };
  } else if (score >= 40) {
    return {
      status: "Fair Visibility",
      description: "Suitable for bright objects. Some atmospheric interference expected."
    };
  } else {
    return {
      status: "Poor Visibility",
      description: "Limited stargazing conditions. Consider rescheduling."
    };
  }
}
