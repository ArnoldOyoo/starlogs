import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "starlogs-location";
const HAS_PROMPTED_KEY = "starlogs-location-prompted";

export function useLocation(defaultLocation: string = "London") {
  const [location, setLocation] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || defaultLocation;
  });
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude},${longitude}`);
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, location);
  }, [location]);

  // Auto-detect location on first visit
  useEffect(() => {
    const hasPrompted = localStorage.getItem(HAS_PROMPTED_KEY);
    const hasSavedLocation = localStorage.getItem(STORAGE_KEY);
    
    if (!hasPrompted && !hasSavedLocation && navigator.geolocation) {
      localStorage.setItem(HAS_PROMPTED_KEY, "true");
      detectLocation();
    }
  }, [detectLocation]);

  return {
    location,
    setLocation,
    detectLocation,
    isDetecting,
  };
}
