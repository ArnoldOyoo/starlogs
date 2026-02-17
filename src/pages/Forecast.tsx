import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { 
  Cloud, Eye, Droplets, Wind, MapPin, Moon, Sun, Star, 
  Loader2, ChevronRight, Crosshair, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { 
  useWeeklyForecast, 
  calculateDayVisibilityScore, 
  getVisibilityRating,
  ForecastDay 
} from "@/hooks/useWeeklyForecast";
import { useCelestialEvents } from "@/hooks/useCelestialEvents";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { useState } from "react";
import { LocationSearch } from "@/components/dashboard/LocationSearch";
import { CelestialEventDialog } from "@/components/dashboard/CelestialEventDialog";

function getMoonEmoji(phase: string): string {
  const lower = phase.toLowerCase();
  if (lower.includes("new")) return "🌑";
  if (lower.includes("waxing crescent")) return "🌒";
  if (lower.includes("first quarter")) return "🌓";
  if (lower.includes("waxing gibbous")) return "🌔";
  if (lower.includes("full")) return "🌕";
  if (lower.includes("waning gibbous")) return "🌖";
  if (lower.includes("last quarter") || lower.includes("third quarter")) return "🌗";
  if (lower.includes("waning crescent")) return "🌘";
  return "🌙";
}

function DayForecastCard({ 
  day, 
  isSelected, 
  onClick 
}: { 
  day: ForecastDay; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const date = parseISO(day.date);
  const score = calculateDayVisibilityScore(day);
  const rating = getVisibilityRating(score);
  
  const dayLabel = isToday(date) 
    ? "Today" 
    : isTomorrow(date) 
      ? "Tomorrow" 
      : format(date, "EEE");

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-28 p-4 rounded-xl transition-all duration-200 text-center",
        isSelected 
          ? "glass-card card-glow border-primary" 
          : "glass-card hover:border-primary/50"
      )}
    >
      <p className="text-xs text-muted-foreground mb-1">{dayLabel}</p>
      <p className="text-sm font-medium text-foreground mb-3">{format(date, "MMM d")}</p>
      
      {/* Visibility Score Circle */}
      <div className="relative w-14 h-14 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke={score >= 60 ? "hsl(var(--primary))" : score >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${score * 0.94} 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{score}</span>
        </div>
      </div>
      
      <p className={cn("text-xs font-medium", rating.color)}>{rating.label}</p>
      
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="text-lg">{getMoonEmoji(day.astro.moon_phase)}</span>
        <span className="text-xs text-muted-foreground">{day.astro.moon_illumination}%</span>
      </div>
    </button>
  );
}

function SelectedDayDetails({ day, events }: { day: ForecastDay; events: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const date = parseISO(day.date);
  const score = calculateDayVisibilityScore(day);
  const rating = getVisibilityRating(score);
  
  // Get nighttime hours for optimal viewing window
  const nightHours = day.hour.filter((h) => {
    const hour = parseInt(h.time.split(" ")[1].split(":")[0]);
    return hour >= 20 || hour <= 5;
  });
  
  const bestHours = nightHours
    .map((h) => ({ ...h, score: 100 - h.cloud - (h.humidity > 70 ? 10 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const avgCloud = nightHours.length 
    ? Math.round(nightHours.reduce((sum, h) => sum + h.cloud, 0) / nightHours.length)
    : 0;
  const avgHumidity = nightHours.length
    ? Math.round(nightHours.reduce((sum, h) => sum + h.humidity, 0) / nightHours.length)
    : 0;
  const avgWind = nightHours.length
    ? Math.round(nightHours.reduce((sum, h) => sum + h.wind_kph, 0) / nightHours.length)
    : 0;

  // Filter events for this day
  const dayEvents = events.filter((e) => {
    if (!e.date) return true; // Show recurring events
    try {
      const eventDate = new Date(e.date);
      return format(eventDate, "yyyy-MM-dd") === day.date;
    } catch {
      return false;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Score */}
      <div className="glass-card card-glow rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">
            {format(date, "EEEE, MMMM d")}
          </h3>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={score >= 60 ? "hsl(var(--primary))" : score >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold text-foreground">{score}</span>
            <span className={cn("text-sm font-medium", rating.color)}>{rating.label}</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {score >= 70 
              ? "Great night for deep sky objects!" 
              : score >= 50 
                ? "Decent conditions for planets and bright objects."
                : "Consider rescheduling if possible."}
          </p>
          {bestHours.length > 0 && (
            <p className="text-sm">
              Best viewing: <span className="text-primary font-medium">
                {bestHours[0].time.split(" ")[1]} - {bestHours[bestHours.length - 1].time.split(" ")[1]}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Conditions Grid */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-foreground">
          Nighttime Conditions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cloud Cover</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{avgCloud}%</p>
            <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  avgCloud <= 20 ? "bg-success" : avgCloud <= 50 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${avgCloud}%` }}
              />
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Humidity</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{avgHumidity}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {avgHumidity > 70 ? "Dew risk" : "Low dew risk"}
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Wind</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{avgWind}</p>
            <p className="text-xs text-muted-foreground">km/h avg</p>
          </div>
          
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Seeing</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              {avgWind < 10 && avgCloud < 30 ? "Good" : avgWind < 20 ? "Fair" : "Poor"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Atmospheric stability</p>
          </div>
        </div>

        {/* Sun/Moon Times */}
        <div className="glass-card rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Sun className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sunset</p>
                <p className="text-sm font-medium text-foreground">{day.astro.sunset}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{day.astro.moon_phase}</p>
                <p className="text-sm font-medium text-foreground">{day.astro.moon_illumination}% illuminated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celestial Events */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Celestial Highlights
        </h3>
        
        {dayEvents.length > 0 ? (
          <div className="space-y-3">
            {dayEvents.slice(0, 4).map((event, i) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm">{event.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {event.description || event.type}
                    </p>
                    {event.time && (
                      <p className="text-xs text-primary mt-1">
                        {event.time instanceof Date ? format(event.time, "h:mm a") : event.time}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No major events scheduled. Still a great night for general stargazing!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Planets", "Deep Sky", "Constellations"].map((tag) => (
                <span 
                  key={tag}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="glass-card rounded-xl p-4 border-l-4 border-primary">
          <h4 className="text-sm font-medium text-foreground mb-2">Pro Tip</h4>
          <p className="text-xs text-muted-foreground">
            {day.astro.moon_illumination > 50 
              ? "Bright moon tonight — focus on planets and double stars rather than faint nebulae."
              : day.astro.moon_illumination < 20
                ? "Dark skies! Perfect for galaxies, nebulae, and the Milky Way."
                : "Moderate moonlight — good balance for most targets."}
          </p>
        </div>

        <CelestialEventDialog 
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      </div>
    </div>
  );
}

export default function Forecast() {
  const { location, setLocation, detectLocation, isDetecting } = useLocation();
  const { data: forecast, isLoading } = useWeeklyForecast(location);
  const { data: events } = useCelestialEvents();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const displayLocation = forecast 
    ? `${forecast.location.name}, ${forecast.location.country}` 
    : location;

  const selectedDay = forecast?.forecast?.forecastday?.[selectedDayIndex];

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              7-Day Astronomy Forecast
            </h1>
            <p className="text-muted-foreground">
              Plan your stargazing sessions with visibility predictions for the week ahead
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LocationSearch
              currentLocation={location}
              onLocationChange={setLocation}
              onDetectLocation={detectLocation}
              isDetecting={isDetecting}
            />
            <Button 
              variant="outline" 
              className="border-border bg-card"
              onClick={detectLocation}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Forecast for <span className="text-foreground font-medium">{displayLocation}</span>
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : forecast?.forecast?.forecastday ? (
          <>
            {/* Weekly Overview */}
            <div className="mb-8">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {forecast.forecast.forecastday.length}-Day Overview
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                {forecast.forecast.forecastday.map((day, index) => (
                  <DayForecastCard
                    key={day.date}
                    day={day}
                    isSelected={index === selectedDayIndex}
                    onClick={() => setSelectedDayIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Selected Day Details */}
            {selectedDay && (
              <SelectedDayDetails day={selectedDay} events={events || []} />
            )}
          </>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Unable to load forecast data. Please try again.</p>
          </div>
        )}

        <Footer />
      </div>
    </MainLayout>
  );
}
