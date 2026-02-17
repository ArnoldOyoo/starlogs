import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { SkyMapCanvas } from "@/components/skymap/SkyMapCanvas";
import { ObjectInfoPanel } from "@/components/skymap/ObjectInfoPanel";
import { SkyMapControls } from "@/components/skymap/SkyMapControls";
import { LocationSearch } from "@/components/dashboard/LocationSearch";
import { useLocation } from "@/hooks/useLocation";
import { CelestialPosition } from "@/hooks/useSkyMap";
import { Compass, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SkyMap() {
  const { location, setLocation, detectLocation, isDetecting } = useLocation();
  const [selectedObject, setSelectedObject] = useState<CelestialPosition | null>(null);
  
  // Display settings
  const [showConstellations, setShowConstellations] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0);
  
  // New settings
  const [showAltAzGrid, setShowAltAzGrid] = useState(false);
  const [showEqGrid, setShowEqGrid] = useState(false);
  const [magnitudeLimit, setMagnitudeLimit] = useState(5);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Parse location to get coordinates
  const parseLocation = (loc: string): { lat: number; lng: number } => {
    if (loc.includes(",")) {
      const [lat, lng] = loc.split(",").map((s) => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return { lat: 51.5074, lng: -0.1278 };
  };

  const coords = parseLocation(location);

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              Sky Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive star chart for your location
            </p>
          </div>
          <div className="w-full md:w-80">
            <LocationSearch
              currentLocation={location}
              onLocationChange={setLocation}
              onDetectLocation={detectLocation}
              isDetecting={isDetecting}
            />
          </div>
        </div>

        <Alert className="bg-primary/10 border-primary/30">
          <Info className="w-4 h-4 text-primary" />
          <AlertDescription className="text-sm text-foreground">
            Real-time sky showing stars, planets, and the Moon visible from your location.
            Drag to pan, scroll to zoom, click objects for details.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Sky Map Canvas */}
          <div className="glass-card card-glow rounded-xl p-4 lg:p-6">
            <SkyMapCanvas
              latitude={coords.lat}
              longitude={coords.lng}
              showConstellations={showConstellations}
              showLabels={showLabels}
              showAltAzGrid={showAltAzGrid}
              showEqGrid={showEqGrid}
              magnitudeLimit={magnitudeLimit}
              zoomLevel={zoomLevel}
              onObjectSelect={setSelectedObject}
              onZoomChange={setZoomLevel}
            />
            <div className="mt-4 flex items-center justify-center gap-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-foreground" />
                <span>Stars</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Planets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-300" />
                <span>Moon</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ObjectInfoPanel object={selectedObject} />
            <SkyMapControls
              showConstellations={showConstellations}
              onShowConstellationsChange={setShowConstellations}
              showLabels={showLabels}
              onShowLabelsChange={setShowLabels}
              timeOffset={timeOffset}
              onTimeOffsetChange={setTimeOffset}
              showAltAzGrid={showAltAzGrid}
              onShowAltAzGridChange={setShowAltAzGrid}
              showEqGrid={showEqGrid}
              onShowEqGridChange={setShowEqGrid}
              magnitudeLimit={magnitudeLimit}
              onMagnitudeLimitChange={setMagnitudeLimit}
              zoomLevel={zoomLevel}
              onZoomLevelChange={setZoomLevel}
            />
            
            {/* Quick stats */}
            <div className="glass-card card-glow rounded-xl p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Location</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Latitude: {coords.lat.toFixed(4)}°</p>
                <p>Longitude: {coords.lng.toFixed(4)}°</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </MainLayout>
  );
}
