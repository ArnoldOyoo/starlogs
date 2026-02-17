import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { VisibilityStatus } from "@/components/dashboard/VisibilityStatus";
import { VisibilityChart } from "@/components/dashboard/VisibilityChart";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { MoonPhaseCard } from "@/components/dashboard/MoonPhaseCard";
import { TonightHighlights } from "@/components/dashboard/TonightHighlights";
import { FeaturedNewsCard } from "@/components/dashboard/FeaturedNewsCard";
import { ThermometerSun, Wind, Droplet, CloudSun, Loader2 } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useSpaceflightNews } from "@/hooks/useAstronomyNews";
import { useLocation } from "@/hooks/useLocation";
import { useCelestialEvents } from "@/hooks/useCelestialEvents";
import { calculateVisibilityScore, getVisibilityStatus } from "@/services/weatherApi";
import { format } from "date-fns";


export default function Dashboard() {
  const { location, setLocation, detectLocation, isDetecting } = useLocation();
  const { data: weather, isLoading: weatherLoading, isFetching: weatherFetching, refetch: refetchWeather } = useWeather(location);
  const { data: newsArticles, isLoading: newsLoading, isFetching: newsFetching, refetch: refetchNews } = useSpaceflightNews(1);
  const { data: celestialEvents, isLoading: eventsLoading, isFetching: eventsFetching, refetch: refetchEvents } = useCelestialEvents();

  const isRefreshing = weatherFetching || newsFetching || eventsFetching;

  const handleRefresh = () => {
    refetchWeather();
    refetchNews();
    refetchEvents();
  };

  const displayLocation = weather 
    ? `${weather.location.name}, ${weather.location.country}` 
    : location;

  const visibilityScore = weather ? calculateVisibilityScore(weather) : 0;
  const visibilityInfo = getVisibilityStatus(visibilityScore);

  const moonData = weather?.forecast?.forecastday?.[0]?.astro;
  const currentDate = weather?.location?.localtime 
    ? format(new Date(weather.location.localtime), "MMM dd, yyyy")
    : format(new Date(), "MMM dd, yyyy");
  const currentTime = weather?.location?.localtime
    ? format(new Date(weather.location.localtime), "HH:mm")
    : format(new Date(), "HH:mm");

  const getCloudStatus = (cloud: number) => {
    if (cloud <= 10) return { text: "Clear", color: "success" as const };
    if (cloud <= 30) return { text: "Mostly Clear", color: "success" as const };
    if (cloud <= 60) return { text: "Partly Cloudy", color: "warning" as const };
    return { text: "Cloudy", color: "warning" as const };
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity <= 50) return "Low dew risk";
    if (humidity <= 70) return "Moderate";
    return "High dew risk";
  };

  const getNextMoonPhase = (currentPhase?: string): string => {
    if (!currentPhase) return "First Quarter";
    const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
    const currentIndex = phases.findIndex(p => currentPhase.toLowerCase().includes(p.toLowerCase()));
    return phases[(currentIndex + 1) % phases.length];
  };

  const getNextPhaseDate = (currentPhase?: string): string => {
    if (!currentPhase) return "~7 days";
    // Approximate days until next phase
    return "~7 days";
  };

  if (weatherLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <DashboardHeader
          location={location}
          displayLocation={displayLocation}
          date={currentDate}
          time={currentTime}
          onRefresh={handleRefresh}
          onLocationChange={setLocation}
          onDetectLocation={detectLocation}
          isDetecting={isDetecting}
          isRefreshing={isRefreshing}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <VisibilityStatus
            score={visibilityScore}
            status={visibilityInfo.status}
            description={visibilityInfo.description}
            seeing={visibilityScore >= 70 ? "4/5" : visibilityScore >= 50 ? "3/5" : "2/5"}
            transparency={visibilityScore >= 60 ? "High" : visibilityScore >= 40 ? "Medium" : "Low"}
            bortle="Class 4"
          />
          <VisibilityChart baseScore={visibilityScore} />
        </div>

        {/* Weather Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <WeatherCard
            icon={ThermometerSun}
            label="Temperature"
            value={weather ? `${Math.round(weather.current.temp_c)}°C` : "--"}
            subValue={weather ? `Feels ${Math.round(weather.current.feelslike_c)}°C` : ""}
            subValueColor="primary"
            iconColor="text-orange-400"
          />
          <WeatherCard
            icon={Wind}
            label="Wind Speed"
            value={weather ? `${Math.round(weather.current.wind_kph)} km/h` : "--"}
            subValue={weather?.current.wind_dir || ""}
            iconColor="text-sky-400"
          />
          <WeatherCard
            icon={Droplet}
            label="Humidity"
            value={weather ? `${weather.current.humidity}%` : "--"}
            subValue={weather ? getHumidityStatus(weather.current.humidity) : ""}
            iconColor="text-blue-400"
          />
          <WeatherCard
            icon={CloudSun}
            label="Cloud Cover"
            value={weather ? `${weather.current.cloud}%` : "--"}
            subValue={weather ? getCloudStatus(weather.current.cloud).text : ""}
            subValueColor={weather ? getCloudStatus(weather.current.cloud).color : "default"}
            iconColor="text-slate-300"
          />
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <MoonPhaseCard
              phase={moonData?.moon_phase || "Unknown"}
              illumination={moonData?.moon_illumination ? parseInt(moonData.moon_illumination, 10) : 0}
              riseTime={moonData?.moonrise || "--:--"}
              setTime={moonData?.moonset || "--:--"}
              nextPhase={getNextMoonPhase(moonData?.moon_phase)}
              nextPhaseDate={getNextPhaseDate(moonData?.moon_phase)}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eventsLoading ? (
            <div className="glass-card card-glow rounded-xl flex items-center justify-center h-72">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <TonightHighlights 
              events={celestialEvents || []} 
              moonPhase={moonData?.moon_phase}
              moonIllumination={moonData?.moon_illumination ? parseInt(moonData.moon_illumination, 10) : undefined}
              visibilityScore={visibilityScore}
            />
          )}
          {newsLoading ? (
            <div className="glass-card card-glow rounded-xl flex items-center justify-center h-72">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : newsArticles && newsArticles[0] ? (
            <FeaturedNewsCard article={newsArticles[0]} />
          ) : (
            <div className="glass-card card-glow rounded-xl flex items-center justify-center h-72">
              <p className="text-muted-foreground text-sm">Unable to load featured news</p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </MainLayout>
  );
}
