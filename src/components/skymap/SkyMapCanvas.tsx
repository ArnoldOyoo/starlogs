import { useRef, useEffect, useCallback, useState } from "react";
import { useSkyMap, CelestialPosition } from "@/hooks/useSkyMap";
import { ZoomIn, ZoomOut, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkyMapCanvasProps {
  latitude: number;
  longitude: number;
  showConstellations: boolean;
  showLabels: boolean;
  showAltAzGrid?: boolean;
  showEqGrid?: boolean;
  magnitudeLimit?: number;
  zoomLevel?: number;
  onObjectSelect?: (object: CelestialPosition | null) => void;
  onZoomChange?: (zoom: number) => void;
}

export function SkyMapCanvas({
  latitude,
  longitude,
  showConstellations,
  showLabels,
  showAltAzGrid = false,
  showEqGrid = false,
  magnitudeLimit = 5,
  zoomLevel = 1,
  onObjectSelect,
  onZoomChange,
}: SkyMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pan and zoom state
  const [zoom, setZoom] = useState(zoomLevel);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Sync external zoom
  useEffect(() => {
    setZoom(zoomLevel);
  }, [zoomLevel]);

  // Get container dimensions
  const getCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return { width: rect.width, height: Math.min(rect.width, 600) };
    }
    return { width: 600, height: 600 };
  }, []);

  const dimensions = getCanvasDimensions();

  const { stars, planets, moon, constellationSegments, time, setSelectedObject } = useSkyMap({
    latitude,
    longitude,
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height,
  });

  // Filter stars by magnitude
  const visibleStars = stars.filter((star) => (star.magnitude || 2) <= magnitudeLimit);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart({ x: pan.x, y: pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      setPan({
        x: Math.max(-200, Math.min(200, panStart.x + dx)),
        y: Math.max(-200, Math.min(200, panStart.y + dy)),
      });
    }
  }, [isDragging, dragStart, panStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click on canvas
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find nearest object within 20 pixels (adjusted for zoom)
      const allObjects = [...visibleStars, ...planets, ...(moon ? [moon] : [])];
      let nearest: CelestialPosition | null = null;
      let nearestDist = 20 / zoom;

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      for (const obj of allObjects) {
        // Apply zoom and pan transforms
        const objX = centerX + (obj.x - centerX + pan.x) * zoom;
        const objY = centerY + (obj.y - centerY + pan.y) * zoom;
        
        const dist = Math.sqrt((objX - x) ** 2 + (objY - y) ** 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = obj;
        }
      }

      setSelectedObject(nearest);
      onObjectSelect?.(nearest);
    },
    [visibleStars, planets, moon, setSelectedObject, onObjectSelect, zoom, pan, dimensions, isDragging]
  );

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom + 0.2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onZoomChange?.(1);
  };

  // Draw the sky map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear and draw background gradient (night sky)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * zoom);
    gradient.addColorStop(0, "hsl(222, 47%, 8%)");
    gradient.addColorStop(1, "hsl(222, 47%, 4%)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Save context and apply transformations
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX + pan.x, -centerY + pan.y);

    // Draw horizon circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "hsl(217, 91%, 60%)";
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();

    // Draw altitude circles (Alt/Az Grid)
    if (showAltAzGrid) {
      ctx.strokeStyle = "hsla(217, 91%, 60%, 0.3)";
      ctx.lineWidth = 1 / zoom;
      
      // Altitude circles (every 15°)
      for (const alt of [15, 30, 45, 60, 75]) {
        const r = radius * (90 - alt) / 90;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label altitude
        ctx.fillStyle = "hsla(217, 91%, 60%, 0.5)";
        ctx.font = `${10 / zoom}px 'Share Tech Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${alt}°`, centerX, centerY - r - 3 / zoom);
      }
      
      // Azimuth lines (every 30°)
      for (let az = 0; az < 360; az += 30) {
        const rad = (az - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(rad), centerY + radius * Math.sin(rad));
        ctx.stroke();
      }
    } else {
      // Basic altitude circles (30° and 60°)
      ctx.strokeStyle = "hsla(217, 91%, 60%, 0.2)";
      ctx.lineWidth = 1 / zoom;
      for (const alt of [30, 60]) {
        const r = radius * (90 - alt) / 90;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw equatorial grid if enabled
    if (showEqGrid) {
      ctx.strokeStyle = "hsla(45, 70%, 50%, 0.25)";
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);
      
      // Draw declination circles (simplified representation)
      for (const dec of [-60, -30, 0, 30, 60]) {
        const r = radius * (1 - (dec + 90) / 180) * 0.8;
        if (r > 0 && r < radius) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // Draw cardinal direction markers
    ctx.fillStyle = "hsl(217, 91%, 60%)";
    ctx.font = `bold ${14 / zoom}px 'Share Tech Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const cardinals = [
      { label: "N", angle: -90 },
      { label: "E", angle: 0 },
      { label: "S", angle: 90 },
      { label: "W", angle: 180 },
    ];

    for (const { label, angle } of cardinals) {
      const rad = angle * (Math.PI / 180);
      const x = centerX + (radius + 12 / zoom) * Math.cos(rad);
      const y = centerY + (radius + 12 / zoom) * Math.sin(rad);
      ctx.fillText(label, x, y);
    }

    // Draw constellation lines
    if (showConstellations) {
      ctx.strokeStyle = "hsla(217, 91%, 60%, 0.3)";
      ctx.lineWidth = 1 / zoom;
      for (const segment of constellationSegments) {
        ctx.beginPath();
        ctx.moveTo(segment.from.x, segment.from.y);
        ctx.lineTo(segment.to.x, segment.to.y);
        ctx.stroke();
      }
    }

    // Draw stars (filtered by magnitude)
    for (const star of visibleStars) {
      // Size based on magnitude (brighter = larger)
      const size = Math.max(1, 4 - (star.magnitude || 2) * 0.5) / zoom;
      
      // Draw star glow
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
      glow.addColorStop(0, "hsla(210, 40%, 98%, 0.8)");
      glow.addColorStop(1, "hsla(210, 40%, 98%, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(star.x - size * 3, star.y - size * 3, size * 6, size * 6);
      
      // Draw star point
      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(210, 40%, 98%)";
      ctx.fill();

      // Draw label for bright stars
      if (showLabels && (star.magnitude || 2) < 1.5) {
        ctx.fillStyle = "hsla(210, 40%, 98%, 0.7)";
        ctx.font = `${10 / zoom}px 'Share Tech Mono', monospace`;
        ctx.textAlign = "left";
        ctx.fillText(star.name, star.x + size + 4 / zoom, star.y + 3 / zoom);
      }
    }

    // Draw planets
    const planetColors: Record<string, string> = {
      Mercury: "hsl(30, 40%, 60%)",
      Venus: "hsl(45, 80%, 70%)",
      Mars: "hsl(10, 70%, 55%)",
      Jupiter: "hsl(35, 50%, 65%)",
      Saturn: "hsl(45, 40%, 60%)",
    };

    for (const planet of planets) {
      const color = planetColors[planet.name] || "hsl(45, 70%, 70%)";
      
      // Draw planet glow
      const glow = ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, 12 / zoom);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(planet.x - 12 / zoom, planet.y - 12 / zoom, 24 / zoom, 24 / zoom);
      
      // Draw planet
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, 5 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      if (showLabels) {
        ctx.fillStyle = color;
        ctx.font = `bold ${11 / zoom}px 'Share Tech Mono', monospace`;
        ctx.textAlign = "left";
        ctx.fillText(planet.name, planet.x + 8 / zoom, planet.y + 4 / zoom);
      }
    }

    // Draw Moon
    if (moon) {
      // Moon glow
      const moonGlow = ctx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, 20 / zoom);
      moonGlow.addColorStop(0, "hsla(45, 20%, 90%, 0.5)");
      moonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moon.x - 20 / zoom, moon.y - 20 / zoom, 40 / zoom, 40 / zoom);

      // Moon circle
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, 8 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(45, 15%, 85%)";
      ctx.fill();

      if (showLabels) {
        ctx.fillStyle = "hsl(45, 15%, 85%)";
        ctx.font = `bold ${11 / zoom}px 'Share Tech Mono', monospace`;
        ctx.textAlign = "left";
        ctx.fillText("Moon", moon.x + 12 / zoom, moon.y + 4 / zoom);
      }
    }

    // Restore context
    ctx.restore();

    // Draw time display (not affected by zoom/pan)
    ctx.fillStyle = "hsla(210, 40%, 98%, 0.8)";
    ctx.font = "12px 'Share Tech Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      10,
      10
    );

    // Draw zoom indicator
    ctx.fillStyle = "hsla(210, 40%, 98%, 0.6)";
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${zoom.toFixed(1)}x`, width - 10, 12);

  }, [visibleStars, planets, moon, constellationSegments, showConstellations, showLabels, 
      showAltAzGrid, showEqGrid, dimensions, time, zoom, pan]);

  return (
    <div className="space-y-2">
      {/* Zoom controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} title="Reset View">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Move className="w-3 h-3" />
          <span>Drag to pan • Scroll to zoom</span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full aspect-square max-h-[600px]">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full h-full rounded-xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        />
      </div>
    </div>
  );
}
