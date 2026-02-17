import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Rocket, Sparkles, Clock, Calendar, MapPin, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface CelestialEvent {
  id: string;
  name: string;
  type: string;
  description?: string;
  date?: string | Date;
  time?: string | Date;
  visibility?: string;
  location?: string;
  tips?: string;
}

interface CelestialEventDialogProps {
  event: CelestialEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap = {
  meteor: Sparkles,
  planet: Star,
  launch: Rocket,
  eclipse: Star,
  conjunction: Star,
  default: Star,
};

export function CelestialEventDialog({ event, open, onOpenChange }: CelestialEventDialogProps) {
  if (!event) return null;

  const eventType = event.type?.toLowerCase() || "default";
  const Icon = iconMap[eventType as keyof typeof iconMap] || iconMap.default;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch {
      return String(date);
    }
  };

  const formatTime = (time: string | Date | undefined) => {
    if (!time) return null;
    try {
      if (time instanceof Date) {
        return time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }
      return String(time);
    } catch {
      return String(time);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{event.name}</DialogTitle>
              <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {event.date && (
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3" />
                  Date
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(event.date)}
                </p>
              </div>
            )}

            {event.time && (
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  Time
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatTime(event.time)}
                </p>
              </div>
            )}

            {event.visibility && (
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Eye className="w-3 h-3" />
                  Visibility
                </div>
                <p className="text-sm font-medium text-foreground">
                  {event.visibility}
                </p>
              </div>
            )}

            {event.location && (
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </div>
                <p className="text-sm font-medium text-foreground">
                  {event.location}
                </p>
              </div>
            )}
          </div>

          {event.tips && (
            <div className="glass-card rounded-lg p-4 border-l-4 border-primary">
              <h4 className="text-sm font-medium text-foreground mb-1">Viewing Tips</h4>
              <p className="text-xs text-muted-foreground">{event.tips}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
