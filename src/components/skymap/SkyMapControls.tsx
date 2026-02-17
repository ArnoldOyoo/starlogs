import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings2, Grid3X3, Eye, Clock, Star } from "lucide-react";

interface SkyMapControlsProps {
  showConstellations: boolean;
  onShowConstellationsChange: (value: boolean) => void;
  showLabels: boolean;
  onShowLabelsChange: (value: boolean) => void;
  timeOffset: number;
  onTimeOffsetChange: (value: number) => void;
  // New controls
  showAltAzGrid?: boolean;
  onShowAltAzGridChange?: (value: boolean) => void;
  showEqGrid?: boolean;
  onShowEqGridChange?: (value: boolean) => void;
  magnitudeLimit?: number;
  onMagnitudeLimitChange?: (value: number) => void;
  zoomLevel?: number;
  onZoomLevelChange?: (value: number) => void;
}

export function SkyMapControls({
  showConstellations,
  onShowConstellationsChange,
  showLabels,
  onShowLabelsChange,
  timeOffset,
  onTimeOffsetChange,
  showAltAzGrid = false,
  onShowAltAzGridChange,
  showEqGrid = false,
  onShowEqGridChange,
  magnitudeLimit = 5,
  onMagnitudeLimitChange,
  zoomLevel = 1,
  onZoomLevelChange,
}: SkyMapControlsProps) {
  const formatTimeOffset = (hours: number) => {
    if (hours === 0) return "Now";
    const sign = hours > 0 ? "+" : "";
    return `${sign}${hours}h`;
  };

  return (
    <Card className="glass-card card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="w-4 h-4 text-primary" />
          Display Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visibility toggles */}
        <div className="flex items-center justify-between">
          <Label htmlFor="constellations" className="text-sm text-foreground flex items-center gap-2">
            <Eye className="w-3 h-3 text-muted-foreground" />
            Constellations
          </Label>
          <Switch
            id="constellations"
            checked={showConstellations}
            onCheckedChange={onShowConstellationsChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="labels" className="text-sm text-foreground flex items-center gap-2">
            <Eye className="w-3 h-3 text-muted-foreground" />
            Object Labels
          </Label>
          <Switch
            id="labels"
            checked={showLabels}
            onCheckedChange={onShowLabelsChange}
          />
        </div>

        {/* Grid overlays */}
        {onShowAltAzGridChange && (
          <div className="flex items-center justify-between">
            <Label htmlFor="altaz-grid" className="text-sm text-foreground flex items-center gap-2">
              <Grid3X3 className="w-3 h-3 text-muted-foreground" />
              Alt/Az Grid
            </Label>
            <Switch
              id="altaz-grid"
              checked={showAltAzGrid}
              onCheckedChange={onShowAltAzGridChange}
            />
          </div>
        )}

        {onShowEqGridChange && (
          <div className="flex items-center justify-between">
            <Label htmlFor="eq-grid" className="text-sm text-foreground flex items-center gap-2">
              <Grid3X3 className="w-3 h-3 text-muted-foreground" />
              Equatorial Grid
            </Label>
            <Switch
              id="eq-grid"
              checked={showEqGrid}
              onCheckedChange={onShowEqGridChange}
            />
          </div>
        )}

        {/* Magnitude filter */}
        {onMagnitudeLimitChange && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground flex items-center gap-2">
                <Star className="w-3 h-3 text-muted-foreground" />
                Star Brightness
              </Label>
              <span className="text-sm text-muted-foreground">
                mag ≤ {magnitudeLimit.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[magnitudeLimit]}
              onValueChange={(v) => onMagnitudeLimitChange(v[0])}
              min={1}
              max={6}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower = only brightest stars
            </p>
          </div>
        )}

        {/* Zoom level */}
        {onZoomLevelChange && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground">Zoom</Label>
              <span className="text-sm text-muted-foreground">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[zoomLevel]}
              onValueChange={(v) => onZoomLevelChange(v[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        )}

        {/* Time offset */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              Time Offset
            </Label>
            <span className="text-sm text-muted-foreground">
              {formatTimeOffset(timeOffset)}
            </span>
          </div>
          <Slider
            value={[timeOffset]}
            onValueChange={(v) => onTimeOffsetChange(v[0])}
            min={-12}
            max={12}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Preview sky at different times
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
