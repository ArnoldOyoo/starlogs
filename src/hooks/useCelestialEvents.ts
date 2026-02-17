import { useQuery } from "@tanstack/react-query";
import { getCelestialEvents, CelestialEvent } from "@/services/celestialEventsApi";

interface UseCelestialEventsOptions {
  lat?: number;
  lng?: number;
}

export function useCelestialEvents(options: UseCelestialEventsOptions = {}) {
  const { lat, lng } = options;
  
  return useQuery<CelestialEvent[]>({
    queryKey: ["celestialEvents", lat, lng],
    queryFn: () => getCelestialEvents(lat, lng),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}
