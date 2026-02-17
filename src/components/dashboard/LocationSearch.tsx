import { useState } from "react";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationSearchProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  onDetectLocation: () => void;
  isDetecting: boolean;
}

export function LocationSearch({
  currentLocation,
  onLocationChange,
  onDetectLocation,
  isDetecting,
}: LocationSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onLocationChange(searchValue.trim());
      setSearchValue("");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDetect = () => {
    onDetectLocation();
    setIsOpen(false);
  };

  // Display a cleaned location name (remove coordinates if present)
  const displayLocation = currentLocation.includes(",") && !isNaN(parseFloat(currentLocation.split(",")[0]))
    ? "Current Location"
    : currentLocation;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm group-hover:underline">{displayLocation}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-card border-border" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="City name or coordinates..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background border-border"
              />
              <Button size="icon" onClick={handleSearch} disabled={!searchValue.trim()}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-border"
            onClick={handleDetect}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            {isDetecting ? "Detecting..." : "Use My Location"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Enter a city name, postal code, or coordinates (lat,lon)
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
