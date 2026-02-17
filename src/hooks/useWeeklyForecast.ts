import { useQuery } from "@tanstack/react-query";

const WEATHER_API_KEY = "3af02a9d69a54591b0540255260301";

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avghumidity: number;
    daily_chance_of_rain: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: number;
  };
  hour: {
    time: string;
    temp_c: number;
    cloud: number;
    humidity: number;
    wind_kph: number;
    chance_of_rain: number;
    vis_km: number;
    condition: {
      text: string;
    };
  }[];
}

export interface WeeklyForecast {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  forecast: {
    forecastday: ForecastDay[];
  };
}

export async function fetchWeeklyForecast(location: string): Promise<WeeklyForecast> {
  // WeatherAPI free tier only supports up to 3 days; paid plans support up to 14 days
  // Using days=14 to get maximum available days based on plan
  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=14&aqi=no`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weekly forecast");
  }

  return response.json();
}

export function useWeeklyForecast(location: string) {
  return useQuery<WeeklyForecast>({
    queryKey: ["weekly-forecast", location],
    queryFn: () => fetchWeeklyForecast(location),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!location,
  });
}

// Calculate astronomy visibility score for a forecast day
export function calculateDayVisibilityScore(day: ForecastDay): number {
  // Get nighttime hours (20:00 - 05:00)
  const nightHours = day.hour.filter((h) => {
    const hour = parseInt(h.time.split(" ")[1].split(":")[0]);
    return hour >= 20 || hour <= 5;
  });

  if (nightHours.length === 0) return 50;

  const avgCloud = nightHours.reduce((sum, h) => sum + h.cloud, 0) / nightHours.length;
  const avgHumidity = nightHours.reduce((sum, h) => sum + h.humidity, 0) / nightHours.length;
  const avgWind = nightHours.reduce((sum, h) => sum + h.wind_kph, 0) / nightHours.length;
  const rainChance = Math.max(...nightHours.map((h) => h.chance_of_rain));

  // Calculate base score
  let score = 100;

  // Cloud cover (most important) - 0-40 points deduction
  score -= (avgCloud / 100) * 40;

  // Humidity - 0-15 points deduction (high humidity = dew/fog risk)
  if (avgHumidity > 60) {
    score -= ((avgHumidity - 60) / 40) * 15;
  }

  // Wind - 0-10 points deduction (affects seeing)
  if (avgWind > 15) {
    score -= Math.min(((avgWind - 15) / 30) * 10, 10);
  }

  // Rain chance - 0-20 points deduction
  score -= (rainChance / 100) * 20;

  // Moon illumination penalty (bright moon = harder to see faint objects)
  const moonIllum = day.astro.moon_illumination;
  score -= (moonIllum / 100) * 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getVisibilityRating(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-success" };
  if (score >= 60) return { label: "Good", color: "text-primary" };
  if (score >= 40) return { label: "Fair", color: "text-warning" };
  return { label: "Poor", color: "text-destructive" };
}
