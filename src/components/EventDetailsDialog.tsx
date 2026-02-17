import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Star, Eye } from "lucide-react";
import { format } from "date-fns";
import type { CelestialEvent } from "@/services/celestialEventsApi";

interface EventDetailsDialogProps {
  event: CelestialEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getEventImage = (type: string, title: string): string => {
  if (type === "meteor") return "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format&fit=crop";
  if (type === "iss") return "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop";
  if (title.includes("Jupiter")) return "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&auto=format&fit=crop";
  if (title.includes("Saturn")) return "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop";
  if (title.includes("Mars")) return "https://images.unsplash.com/photo-1614728894744-e9a8f1b06b11?w=800&auto=format&fit=crop";
  if (title.includes("Venus")) return "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=800&auto=format&fit=crop";
};

const getStatusLabel = (status: string) => {
  if (status === "visible") return { label: "Visible Now", color: "bg-success/20 text-success" };
  if (status === "soon") return { label: "Coming Soon", color: "bg-warning/20 text-warning" };
  return { label: "Upcoming", color: "bg-muted/50 text-muted-foreground" };
};

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  if (!event) return null;

  const status = getStatusLabel(event.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border p-0 overflow-hidden">
        <div className="relative h-48">
          <img 
            src={getEventImage(event.type, event.title)} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
            <DialogHeader className="mt-2">
              <DialogTitle className="font-display text-2xl text-foreground">
                {event.title}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {event.time ? format(event.time, "MMMM d, yyyy") : "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Best Viewing Time</p>
                <p className="text-sm font-medium text-foreground">
                  {event.time ? format(event.time, "h:mm a") : "After sunset"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Visibility</p>
                <p className="text-sm font-medium text-foreground">
                  Naked eye visible
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">
                  All sky
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
