import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { Calendar as CalendarIcon, Star, Filter, ArrowRight, TrendingUp, Eye, Moon, Cloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { getMeteorShowers, getPlanetaryEvents, type CelestialEvent } from "@/services/celestialEventsApi";
import { format, formatDistanceToNow, isToday, isTomorrow, isSameDay } from "date-fns";
import { calculateVisibilityScore } from "@/services/weatherApi";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const categories = ["All Events", "Meteor Showers", "Planetary", "Eclipses"];

// Map event types to categories for filtering
const typeToCategory: Record<string, string> = {
  meteor: "Meteor Showers",
  planet: "Planetary",
  eclipse: "Eclipses",
  iss: "ISS Passes",
};

// Get image for event type
const getEventImage = (type: string, title: string): string => {
  if (type === "meteor") return "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&auto=format&fit=crop";
  if (type === "iss") return "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop";
  if (type === "eclipse") return "https://images.unsplash.com/photo-1503416997304-7f8bf166c121?w=400&auto=format&fit=crop";
  if (title.includes("Jupiter")) return "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&auto=format&fit=crop";
  if (title.includes("Saturn")) return "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&auto=format&fit=crop";
  if (title.includes("Mars")) return "https://images.unsplash.com/photo-1614728894744-e9a8f1b06b11?w=400&auto=format&fit=crop";
  if (title.includes("Venus")) return "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&auto=format&fit=crop";
  if (title.includes("Mercury")) return "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400&auto=format&fit=crop";
  if (title.includes("Neptune") || title.includes("Uranus")) return "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=400&auto=format&fit=crop";
};

// Get priority based on status
const getPriority = (status: string): "High" | "Med" | "Low" => {
  if (status === "visible") return "High";
  if (status === "soon") return "Med";
  return "Low";
};

const priorityColors = {
  High: "bg-success/20 text-success",
  Med: "bg-warning/20 text-warning",
  Low: "bg-muted/50 text-muted-foreground",
};

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [events, setEvents] = useState<CelestialEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { location } = useLocation();
  const { data: weather, isLoading: weatherLoading } = useWeather(location);
  const navigate = useNavigate();

  const openEventDetails = (event: CelestialEvent) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleAddToCalendar = () => {
    toast.success("Event added to calendar!");
  };

  const handleCheckVisibility = () => {
    navigate("/forecast");
  };

  useEffect(() => {
    const loadEvents = () => {
      setIsLoading(true);
      const meteorEvents = getMeteorShowers();
      const planetEvents = getPlanetaryEvents();
      setEvents([...meteorEvents, ...planetEvents]);
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  // Filter events based on category and selected date
  const filteredEvents = useMemo(() => {
    let filtered = activeCategory === "All Events" 
      ? events 
      : events.filter(e => typeToCategory[e.type] === activeCategory);
    
    if (selectedDate) {
      filtered = filtered.filter(e => e.time && isSameDay(e.time, selectedDate));
    }
    
    return filtered;
  }, [events, activeCategory, selectedDate]);

  // Get dates that have events for calendar highlighting
  const eventDates = useMemo(() => {
    return events
      .filter(e => e.time)
      .map(e => e.time as Date);
  }, [events]);

  // Get hero event (first visible or soonest event)
  const heroEvent = events.find(e => e.status === "visible") || events[0];

  // Format date for display
  const formatEventDate = (time?: Date) => {
    if (!time) return "TBD";
    if (isToday(time)) return "Today";
    if (isTomorrow(time)) return "Tomorrow";
    return format(time, "MMM d");
  };

  // Get category label
  const getCategoryLabel = (type: string) => {
    if (type === "meteor") return "METEOR SHOWER";
    if (type === "planet") return "PLANETARY";
    if (type === "eclipse") return "ECLIPSE";
    if (type === "iss") return "ISS PASS";
    return "CELESTIAL EVENT";
  };

  // Calculate visibility score from weather
  const visibilityScore = weather ? calculateVisibilityScore(weather) : 0;

  // Get cloud cover description
  const getCloudCoverText = (cloudCover?: number) => {
    if (cloudCover === undefined) return "Unknown";
    if (cloudCover < 20) return `${cloudCover}% (Clear)`;
    if (cloudCover < 50) return `${cloudCover}% (Partly Cloudy)`;
    if (cloudCover < 80) return `${cloudCover}% (Mostly Cloudy)`;
    return `${cloudCover}% (Overcast)`;
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Events</h1>
        </div>

        {/* Hero Event */}
        {isLoading ? (
          <div className="mb-12 h-48 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : heroEvent ? (
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm mb-4">
              <TrendingUp className="w-4 h-4" />
              {heroEvent.status === "visible" ? "HAPPENING NOW" : "NEXT MAJOR EVENT"}
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {heroEvent.status === "visible" ? "Visible Tonight:" : "Coming Up:"}<br />
              <span className="text-gradient">{heroEvent.title}</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mb-6 leading-relaxed">
              {heroEvent.description}. {heroEvent.time && `Happening ${formatDistanceToNow(heroEvent.time, { addSuffix: true })}.`}
            </p>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddToCalendar}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
              <Button variant="outline" className="border-border bg-card hover:bg-muted" onClick={handleCheckVisibility}>
                <Eye className="w-4 h-4 mr-2" />
                Check Visibility
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Upcoming Celestial Events
              </h2>
              <p className="text-muted-foreground">
                Discover meteor showers and planetary alignments visible from your location.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <Button variant="outline" size="sm" className="border-border bg-card">
                <Filter className="w-4 h-4" />
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    activeCategory === cat 
                      ? "bg-primary text-primary-foreground" 
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Events Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No events found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => {
                  const priority = getPriority(event.status);
                  return (
                    <div 
                      key={event.id}
                      className="glass-card rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div className="relative h-32">
                        <img 
                          src={getEventImage(event.type, event.title)} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-muted/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatEventDate(event.time)}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-1 rounded-full",
                            priorityColors[priority]
                          )}>
                            {priority}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
                          {getCategoryLabel(event.type)}
                        </span>
                        <h4 className="font-display font-semibold text-foreground mt-1 mb-2">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {event.time ? format(event.time, "MMM d, yyyy") : "TBD"}
                          </span>
                          <button 
                            className="text-primary text-xs flex items-center gap-1 hover:underline"
                            onClick={(e) => { e.stopPropagation(); openEventDetails(event); }}
                          >
                            Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Events Calendar */}
            <div className="glass-card card-glow rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Events Calendar</h3>
                {selectedDate && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDate(undefined)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 pointer-events-auto"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "hsl(var(--primary))",
                    textUnderlineOffset: "4px",
                  },
                }}
              />
              {selectedDate && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} on {format(selectedDate, "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Tonight's Sky */}
            <div className="glass-card card-glow rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Tonight's Sky</h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {weather?.location?.name || location || "Detecting..."}
                </span>
              </div>
              {weatherLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-display text-4xl font-bold text-foreground">
                      {Math.round(visibilityScore / 10)}
                    </span>
                    <span className="text-muted-foreground">/10</span>
                    <Star className="w-6 h-6 text-warning ml-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Visibility Index</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Temperature</p>
                        <p className="text-sm font-medium text-foreground">
                          {weather?.current?.temp_c !== undefined ? `${Math.round(weather.current.temp_c)}°C` : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cloud Cover</p>
                        <p className="text-sm font-medium text-foreground">
                          {getCloudCoverText(weather?.current?.cloud)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => navigate("/forecast")}>
                    Full Forecast <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>

            {/* News */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Latest Astronomy News
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=100&auto=format&fit=crop"
                    alt="News thumbnail"
                    className="w-16 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2">
                      Webb Telescope discovers new features in distant...
                    </h4>
                    <p className="text-xs text-primary mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=100&auto=format&fit=crop"
                    alt="News thumbnail"
                    className="w-16 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2">
                      Mars rover sends back unexpected audio recording
                    </h4>
                    <p className="text-xs text-primary mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
              <button className="text-primary text-sm mt-4 hover:underline" onClick={() => navigate("/news")}>
                View all news
              </button>
            </div>
          </div>
        </div>

        {/* Event Details Dialog */}
        <EventDetailsDialog
          event={selectedEvent}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />

        <Footer />
      </div>
    </MainLayout>
  );
}
