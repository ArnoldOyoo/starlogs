import { useState, useEffect, useCallback } from "react";
import { NasaImage } from "./useNasaGallery";

const FAVORITES_KEY = "starlogs_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<NasaImage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const saveFavorites = useCallback((items: NasaImage[]) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    setFavorites(items);
  }, []);

  const addFavorite = useCallback((image: NasaImage) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === image.id)) return prev;
      const updated = [...prev, image];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((imageId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== imageId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (imageId: string) => favorites.some((f) => f.id === imageId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (image: NasaImage) => {
      if (isFavorite(image.id)) {
        removeFavorite(image.id);
        return false;
      } else {
        addFavorite(image);
        return true;
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites: () => saveFavorites([]),
  };
}
