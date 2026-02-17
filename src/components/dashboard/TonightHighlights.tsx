import { Star, Rocket, Sparkles, ArrowRight, Moon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface HighlightEvent {
  id: string;
  icon: "star" | "rocket" | "sparkle" | "moon" | "eye";
  title: string;
  description: string;
  status: "visible" | "soon" | "upcoming";
}

interface TonightHighlightsProps {
  events: HighlightEvent[];
  moonPhase?: string;
  moonIllumination?: number;
  visibilityScore?: number;
}

const iconMap = {
  star: Star,
  rocket: Rocket,
  sparkle: Sparkles,
  moon: Moon,
  eye: Eye,
};

const statusColors = {
  visible: "bg-success/20 text-success border-success/30",
  soon: "bg-warning/20 text-warning border-warning/30",
  upcoming: "bg-primary/20 text-primary border-primary/30",
};

const iconColors = {
  star: "bg-primary text-primary-foreground",
  rocket: "bg-orange-500 text-white",
  sparkle: "bg-purple-500 text-white",
  moon: "bg-slate-600 text-slate-100",
  eye: "bg-cyan-500 text-white",
};

// Generate tonight-specific highlights based on conditions
function getTonightHighlights(
  events: HighlightEvent[],
  moonPhase?: string,
  moonIllumination?: number,
  visibilityScore?: number
): HighlightEvent[] {
  const tonightEvents: HighlightEvent[] = [];
  
  // Filter for "visible" or "soon" events only (tonight's events)
  const activeEvents = events.filter(e => e.status === "visible" || e.status === "soon");
  tonightEvents.push(...activeEvents.slice(0, 2));

  // Add moon phase highlight if relevant
  if (moonPhase && moonIllumination !== undefined) {
    const isNewMoon = moonPhase.toLowerCase().includes("new");
    const isFullMoon = moonPhase.toLowerCase().includes("full");
    
    if (isNewMoon) {
      tonightEvents.unshift({
        id: "moon-new",
        icon: "moon",
        title: "New Moon Tonight",
        description: "Perfect for deep-sky observation • No moonlight interference",
        status: "visible",
      });
    } else if (isFullMoon) {
      tonightEvents.unshift({
        id: "moon-full",
        icon: "moon",
        title: "Full Moon Tonight",
        description: `${moonIllumination}% illumination • Great for lunar observation`,
        status: "visible",
      });
    } else if (moonIllumination <= 25) {
      tonightEvents.push({
        id: "moon-dark",
        icon: "moon",
        title: "Dark Sky Window",
        description: `Only ${moonIllumination}% moon • Good for faint objects`,
        status: "visible",
      });
    }
  }

  // Add visibility-based suggestion
  if (visibilityScore !== undefined) {
    if (visibilityScore >= 80) {
      tonightEvents.push({
        id: "visibility-excellent",
        icon: "eye",
        title: "Excellent Stargazing Night",
        description: "Clear skies perfect for astrophotography",
        status: "visible",
      });
    } else if (visibilityScore >= 60) {
      tonightEvents.push({
        id: "visibility-good",
        icon: "eye",
        title: "Good Viewing Conditions",
        description: "Suitable for planetary & lunar observation",
        status: "soon",
      });
    }
  }

  // Always visible planets (add as fallback)
  const hasPlanetEvent = tonightEvents.some(e => e.title.toLowerCase().includes("planet") || 
    e.title.toLowerCase().includes("venus") || e.title.toLowerCase().includes("jupiter") ||
    e.title.toLowerCase().includes("mars") || e.title.toLowerCase().includes("saturn"));
  
  if (!hasPlanetEvent && tonightEvents.length < 4) {
    tonightEvents.push({
      id: "planets-visible",
      icon: "star",
      title: "Bright Planets Visible",
      description: "Venus, Jupiter & Mars visible after sunset",
      status: "visible",
    });
  }

  // Limit to 4 highlights max
  return tonightEvents.slice(0, 4);
}

export function TonightHighlights({ 
  events, 
  moonPhase, 
  moonIllumination, 
  visibilityScore 
}: TonightHighlightsProps) {
  const navigate = useNavigate();
  const tonightEvents = getTonightHighlights(events, moonPhase, moonIllumination, visibilityScore);

  return (
    <div className="glass-card card-glow rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Tonight's Highlights</h3>
        <button 
          onClick={() => navigate("/events")}
          className="text-primary text-sm hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {tonightEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No special events tonight
          </p>
        ) : (
          tonightEvents.map((event) => {
            const Icon = iconMap[event.icon] || Star;
            return (
              <div
                key={event.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconColors[event.icon] || iconColors.star)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                </div>
                <span className={cn(
                  "text-[10px] uppercase font-medium px-2 py-1 rounded-full border",
                  statusColors[event.status]
                )}>
                  {event.status === "visible" ? "now" : event.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
