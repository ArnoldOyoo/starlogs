import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "./LocationSearch";

interface DashboardHeaderProps {
  location: string;
  displayLocation: string;
  date: string;
  time: string;
  onRefresh?: () => void;
  onLocationChange: (location: string) => void;
  onDetectLocation: () => void;
  isDetecting: boolean;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  location,
  displayLocation,
  date,
  time,
  onRefresh,
  onLocationChange,
  onDetectLocation,
  isDetecting,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {getGreeting()}, StarLogger
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <LocationSearch
            currentLocation={displayLocation}
            onLocationChange={onLocationChange}
            onDetectLocation={onDetectLocation}
            isDetecting={isDetecting}
          />
          <span className="text-muted-foreground/50">•</span>
          <span className="text-sm">{date}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-sm">{time} UTC</span>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="border-border bg-card hover:bg-muted"
      >
        {isRefreshing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2" />
        )}
        {isRefreshing ? "Refreshing..." : "Refresh Data"}
      </Button>
    </div>
  );
}
