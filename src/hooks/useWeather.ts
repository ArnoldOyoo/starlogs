import { useQuery } from "@tanstack/react-query";
import { fetchWeather, WeatherData } from "@/services/weatherApi";

export function useWeather(location: string = "London") {
  return useQuery<WeatherData>({
    queryKey: ["weather", location],
    queryFn: () => fetchWeather(location),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
}
