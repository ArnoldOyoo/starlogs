import { useState, useEffect, useMemo } from "react";
import * as Astronomy from "astronomy-engine";
import { brightStars, Star, constellationLines } from "@/data/starData";

export interface CelestialPosition {
  name: string;
  x: number;
  y: number;
  altitude: number;
  azimuth: number;
  magnitude?: number;
  type: "star" | "planet" | "moon" | "sun";
  constellation?: string;
}

interface UseSkyMapOptions {
  latitude: number;
  longitude: number;
  canvasWidth: number;
  canvasHeight: number;
}

// Convert altitude/azimuth to canvas coordinates (stereographic projection)
function horizontalToCanvas(
  altitude: number,
  azimuth: number,
  width: number,
  height: number
): { x: number; y: number } | null {
  // Only show objects above horizon
  if (altitude < 0) return null;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  // Stereographic projection
  const r = radius * (90 - altitude) / 90;
  
  // Azimuth: 0 = North (top), 90 = East (right), 180 = South (bottom), 270 = West (left)
  const azRad = (azimuth - 90) * (Math.PI / 180);
  
  const x = centerX + r * Math.cos(azRad);
  const y = centerY + r * Math.sin(azRad);

  return { x, y };
}

export function useSkyMap({ latitude, longitude, canvasWidth, canvasHeight }: UseSkyMapOptions) {
  const [time, setTime] = useState(new Date());
  const [selectedObject, setSelectedObject] = useState<CelestialPosition | null>(null);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const observer = useMemo(
    () => new Astronomy.Observer(latitude, longitude, 0),
    [latitude, longitude]
  );

  // Calculate planet positions
  const planets = useMemo(() => {
    const planetBodies: Astronomy.Body[] = [
      Astronomy.Body.Mercury,
      Astronomy.Body.Venus,
      Astronomy.Body.Mars,
      Astronomy.Body.Jupiter,
      Astronomy.Body.Saturn,
    ];

    const positions: CelestialPosition[] = [];

    for (const body of planetBodies) {
      try {
        const equ = Astronomy.Equator(body, time, observer, true, true);
        const hor = Astronomy.Horizon(time, observer, equ.ra, equ.dec, "normal");

        const pos = horizontalToCanvas(hor.altitude, hor.azimuth, canvasWidth, canvasHeight);
        if (pos) {
          positions.push({
            name: body,
            x: pos.x,
            y: pos.y,
            altitude: hor.altitude,
            azimuth: hor.azimuth,
            type: "planet",
          });
        }
      } catch (e) {
        console.error(`Error calculating ${body} position:`, e);
      }
    }

    return positions;
  }, [time, observer, canvasWidth, canvasHeight]);

  // Calculate Moon position
  const moon = useMemo(() => {
    try {
      const equ = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
      const hor = Astronomy.Horizon(time, observer, equ.ra, equ.dec, "normal");

      const pos = horizontalToCanvas(hor.altitude, hor.azimuth, canvasWidth, canvasHeight);
      if (pos) {
        return {
          name: "Moon",
          x: pos.x,
          y: pos.y,
          altitude: hor.altitude,
          azimuth: hor.azimuth,
          type: "moon" as const,
        };
      }
    } catch (e) {
      console.error("Error calculating Moon position:", e);
    }
    return null;
  }, [time, observer, canvasWidth, canvasHeight]);

  // Calculate star positions
  const stars = useMemo(() => {
    const positions: CelestialPosition[] = [];

    for (const star of brightStars) {
      // Convert RA/Dec to horizontal coordinates
      const hor = Astronomy.Horizon(time, observer, star.ra, star.dec, "normal");

      const pos = horizontalToCanvas(hor.altitude, hor.azimuth, canvasWidth, canvasHeight);
      if (pos) {
        positions.push({
          name: star.name,
          x: pos.x,
          y: pos.y,
          altitude: hor.altitude,
          azimuth: hor.azimuth,
          magnitude: star.magnitude,
          type: "star",
          constellation: star.constellation,
        });
      }
    }

    return positions;
  }, [time, observer, canvasWidth, canvasHeight]);

  // Calculate constellation line segments
  const constellationSegments = useMemo(() => {
    const segments: { from: { x: number; y: number }; to: { x: number; y: number }; name: string }[] = [];

    for (const constellation of constellationLines) {
      for (const [star1Name, star2Name] of constellation.lines) {
        const star1 = stars.find((s) => s.name === star1Name);
        const star2 = stars.find((s) => s.name === star2Name);

        if (star1 && star2) {
          segments.push({
            from: { x: star1.x, y: star1.y },
            to: { x: star2.x, y: star2.y },
            name: constellation.name,
          });
        }
      }
    }

    return segments;
  }, [stars]);

  return {
    stars,
    planets,
    moon,
    constellationSegments,
    time,
    setTime,
    selectedObject,
    setSelectedObject,
  };
}
