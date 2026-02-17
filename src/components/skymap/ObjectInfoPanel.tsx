import { CelestialPosition } from "@/hooks/useSkyMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Globe, Moon } from "lucide-react";

interface ObjectInfoPanelProps {
  object: CelestialPosition | null;
}

export function ObjectInfoPanel({ object }: ObjectInfoPanelProps) {
  if (!object) {
    return (
      <Card className="glass-card card-glow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Object Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click on a star, planet, or the Moon to see details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const Icon = object.type === "planet" ? Globe : object.type === "moon" ? Moon : Star;

  return (
    <Card className="glass-card card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Icon className="w-5 h-5 text-primary" />
          {object.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Type</span>
            <span className="text-foreground capitalize">{object.type}</span>
          </div>
          {object.constellation && (
            <div>
              <span className="text-muted-foreground block">Constellation</span>
              <span className="text-foreground">{object.constellation}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground block">Altitude</span>
            <span className="text-foreground">{object.altitude.toFixed(1)}°</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Azimuth</span>
            <span className="text-foreground">{object.azimuth.toFixed(1)}°</span>
          </div>
          {object.magnitude !== undefined && (
            <div>
              <span className="text-muted-foreground block">Magnitude</span>
              <span className="text-foreground">{object.magnitude.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {object.altitude > 30
              ? "Excellent visibility - high in the sky"
              : object.altitude > 10
              ? "Good visibility - may be affected by horizon haze"
              : "Low on horizon - may be difficult to observe"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
