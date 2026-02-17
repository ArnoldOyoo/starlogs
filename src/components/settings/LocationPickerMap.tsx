import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  lat: number;
  lon: number;
  onLocationChange: (lat: number, lon: number) => void;
}

export function LocationPickerMap({ lat, lon, onLocationChange }: LocationPickerMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(containerRef.current).setView([lat, lon], 8);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(mapRef.current);

    // Add marker
    markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);

    // Handle click
    mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: newLat, lng: newLon } = e.latlng;
      markerRef.current?.setLatLng([newLat, newLon]);
      onLocationChange(newLat, newLon);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker and view when coordinates change externally
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      mapRef.current.setView([lat, lon], mapRef.current.getZoom());
    }
  }, [lat, lon]);

  return (
    <div 
      ref={containerRef} 
      className="rounded-xl overflow-hidden h-48 border border-border z-0"
    />
  );
}
