import { useQuery } from "@tanstack/react-query";
import { fetchAPOD, APODData } from "@/services/nasaApi";

export function useAPOD() {
  return useQuery<APODData>({
    queryKey: ["apod"],
    queryFn: fetchAPOD,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - APOD updates daily
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
