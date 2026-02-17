import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Rocket, ExternalLink, Play, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { UpcomingLaunch } from "@/services/newsApi";

interface LaunchDetailsDialogProps {
  launch: UpcomingLaunch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LaunchDetailsDialog({ launch, open, onOpenChange }: LaunchDetailsDialogProps) {
  if (!launch) return null;

  const launchDate = launch.net ? new Date(launch.net) : null;
  const providerName = launch.launch_service_provider?.name || launch.launch_service_provider?.abbrev || "Unknown Provider";
  const rocketName = launch.rocket?.configuration?.name || "Rocket";
  const rocketFamily = launch.rocket?.configuration?.family;
  const padName = launch.pad?.name || "Unknown Pad";
  const locationName = launch.pad?.location?.name || "Unknown Location";
  const webcastUrl = launch.vidURLs?.[0]?.url;

  const getStatusColor = (abbrev: string) => {
    switch (abbrev?.toLowerCase()) {
      case "go": return "bg-success/20 text-success";
      case "tbd": return "bg-warning/20 text-warning";
      case "tbc": return "bg-primary/20 text-primary";
      default: return "bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border p-0 overflow-hidden">
        {/* Header Image */}
        <div className="relative h-48">
          {launch.image ? (
            <img 
              src={launch.image} 
              alt={launch.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-orange-600/40 flex items-center justify-center">
              <Rocket className="w-16 h-16 text-orange-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(launch.status?.abbrev)}`}>
              {launch.status?.name || "Status Unknown"}
            </span>
            <DialogHeader className="mt-2">
              <DialogTitle className="font-display text-2xl text-foreground">
                {launch.name}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider & Rocket */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">{providerName}</p>
              <p className="text-sm text-muted-foreground">
                {rocketName} {rocketFamily ? `(${rocketFamily})` : ""}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Launch Date</p>
                <p className="text-sm font-medium text-foreground">
                  {launchDate ? format(launchDate, "MMMM d, yyyy") : "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Launch Time</p>
                <p className="text-sm font-medium text-foreground">
                  {launchDate ? format(launchDate, "HH:mm") + " UTC" : "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 col-span-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Launch Site</p>
                <p className="text-sm font-medium text-foreground">{padName}</p>
                <p className="text-xs text-muted-foreground">{locationName}</p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {launchDate && launchDate > new Date() && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-sm text-muted-foreground mb-1">Launching</p>
              <p className="font-display text-xl font-bold text-orange-500">
                {formatDistanceToNow(launchDate, { addSuffix: true })}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {webcastUrl && (
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={() => window.open(webcastUrl, "_blank")}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Live
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}