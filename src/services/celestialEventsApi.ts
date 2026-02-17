// N2YO API for ISS passes
const N2YO_API_KEY = "YOUR_N2YO_API_KEY"; // Replace with your API key
const N2YO_BASE_URL = "https://api.n2yo.com/rest/v1/satellite";
const ISS_NORAD_ID = 25544;

// Open Notify API for ISS current location (fallback, no key needed)
const OPEN_NOTIFY_URL = "http://api.open-notify.org";

export interface ISSPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface ISSPass {
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  maxElevation: number; // degrees
  magnitude: number;
}

export interface VisualPass {
  startAz: number;
  startAzCompass: string;
  startEl: number;
  startUTC: number;
  maxAz: number;
  maxAzCompass: string;
  maxEl: number;
  maxUTC: number;
  endAz: number;
  endAzCompass: string;
  endEl: number;
  endUTC: number;
  mag: number;
  duration: number;
}

export interface N2YOVisualPassesResponse {
  info: {
    satid: number;
    satname: string;
    passescount: number;
  };
  passes: VisualPass[];
}

export interface CelestialEvent {
  id: string;
  type: "iss" | "meteor" | "planet" | "moon" | "eclipse";
  icon: "rocket" | "sparkle" | "star";
  title: string;
  description: string;
  status: "visible" | "soon" | "upcoming";
  time?: Date;
}

// Fetch ISS current position from Open Notify
export async function fetchISSPosition(): Promise<ISSPosition> {
  const response = await fetch(`${OPEN_NOTIFY_URL}/iss-now.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch ISS position");
  }
  const data = await response.json();
  return {
    latitude: parseFloat(data.iss_position.latitude),
    longitude: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
  };
}

// Fetch ISS visual passes from N2YO
export async function fetchISSPasses(
  lat: number,
  lng: number,
  altitude: number = 0,
  days: number = 2,
  minVisibility: number = 60
): Promise<N2YOVisualPassesResponse | null> {
  if (N2YO_API_KEY === "YOUR_N2YO_API_KEY") {
    console.warn("N2YO API key not configured");
    return null;
  }
  
  try {
    const url = `${N2YO_BASE_URL}/visualpasses/${ISS_NORAD_ID}/${lat}/${lng}/${altitude}/${days}/${minVisibility}&apiKey=${N2YO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch ISS passes");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching ISS passes:", error);
    return null;
  }
}

// Get meteor shower data (based on annual calendar)
export function getMeteorShowers(): CelestialEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  
  // Major meteor showers with their peak dates
  const showers = [
    { name: "Quadrantids", start: `${year}-01-01`, peak: `${year}-01-03`, end: `${year}-01-05`, rate: 120 },
    { name: "Lyrids", start: `${year}-04-16`, peak: `${year}-04-22`, end: `${year}-04-25`, rate: 18 },
    { name: "Eta Aquariids", start: `${year}-04-19`, peak: `${year}-05-06`, end: `${year}-05-28`, rate: 50 },
    { name: "Delta Aquariids", start: `${year}-07-12`, peak: `${year}-07-30`, end: `${year}-08-23`, rate: 25 },
    { name: "Perseids", start: `${year}-07-17`, peak: `${year}-08-12`, end: `${year}-08-24`, rate: 100 },
    { name: "Orionids", start: `${year}-10-02`, peak: `${year}-10-21`, end: `${year}-11-07`, rate: 20 },
    { name: "Leonids", start: `${year}-11-06`, peak: `${year}-11-17`, end: `${year}-11-30`, rate: 15 },
    { name: "Geminids", start: `${year}-12-04`, peak: `${year}-12-14`, end: `${year}-12-17`, rate: 150 },
    { name: "Ursids", start: `${year}-12-17`, peak: `${year}-12-22`, end: `${year}-12-26`, rate: 10 },
  ];

  const events: CelestialEvent[] = [];
  const today = now.getTime();

  for (const shower of showers) {
    const startDate = new Date(shower.start);
    const peakDate = new Date(shower.peak);
    const endDate = new Date(shower.end);

    // Check if shower is active or upcoming within next 30 days
    const thirtyDaysFromNow = today + 30 * 24 * 60 * 60 * 1000;
    
    if (today >= startDate.getTime() && today <= endDate.getTime()) {
      // Currently active
      const isPeak = Math.abs(today - peakDate.getTime()) < 24 * 60 * 60 * 1000;
      events.push({
        id: `meteor-${shower.name.toLowerCase()}`,
        type: "meteor",
        icon: "sparkle",
        title: `${shower.name} Meteor Shower`,
        description: isPeak 
          ? `Peak tonight • ~${shower.rate} meteors/hr` 
          : `Active • Peak ${peakDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        status: isPeak ? "visible" : "upcoming",
        time: peakDate,
      });
    } else if (startDate.getTime() > today && startDate.getTime() < thirtyDaysFromNow) {
      // Upcoming within 30 days
      events.push({
        id: `meteor-${shower.name.toLowerCase()}`,
        type: "meteor",
        icon: "sparkle",
        title: `${shower.name} Meteor Shower`,
        description: `Begins ${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ~${shower.rate}/hr`,
        status: "upcoming",
        time: startDate,
      });
    }
  }

  return events;
}

// Get planetary events (conjunctions, oppositions, eclipses, etc.)
export function getPlanetaryEvents(): CelestialEvent[] {
  const now = new Date();
  
  // Comprehensive astronomical events for 2025-2026
  const events: Array<{
    name: string;
    date: string;
    description: string;
    eventType: "opposition" | "conjunction" | "elongation" | "eclipse" | "occultation" | "transit";
  }> = [
    // 2025 events
    { name: "Mars at Opposition", date: "2025-01-16", description: "Best visibility • Mag -1.4", eventType: "opposition" },
    { name: "Venus Greatest Elongation East", date: "2025-01-10", description: "Evening Star • 47° from Sun", eventType: "elongation" },
    { name: "Total Lunar Eclipse", date: "2025-03-14", description: "Visible from Americas, Europe, Africa", eventType: "eclipse" },
    { name: "Mercury Greatest Elongation", date: "2025-03-24", description: "Best evening visibility", eventType: "elongation" },
    { name: "Partial Solar Eclipse", date: "2025-03-29", description: "Visible from Europe, N Africa, N Asia", eventType: "eclipse" },
    { name: "Venus-Jupiter Conjunction", date: "2025-04-30", description: "0.5° separation • Evening sky", eventType: "conjunction" },
    { name: "Mercury Greatest Elongation", date: "2025-05-17", description: "Best morning visibility", eventType: "elongation" },
    { name: "Saturn-Neptune Conjunction", date: "2025-06-15", description: "Rare meeting • 0.4° apart", eventType: "conjunction" },
    { name: "Venus Greatest Elongation West", date: "2025-06-25", description: "Morning Star • 46° from Sun", eventType: "elongation" },
    { name: "Total Lunar Eclipse", date: "2025-09-07", description: "Visible from Europe, Africa, Asia, Australia", eventType: "eclipse" },
    { name: "Partial Solar Eclipse", date: "2025-09-21", description: "Visible from S Pacific, Antarctica", eventType: "eclipse" },
    { name: "Saturn at Opposition", date: "2025-09-21", description: "Rings visible • Mag +0.4", eventType: "opposition" },
    { name: "Neptune at Opposition", date: "2025-09-23", description: "Best visibility • Telescope required", eventType: "opposition" },
    { name: "Uranus at Opposition", date: "2025-11-21", description: "Best visibility • Binoculars needed", eventType: "opposition" },
    { name: "Jupiter at Opposition", date: "2025-12-07", description: "Best visibility • Mag -2.8", eventType: "opposition" },
    { name: "Venus-Saturn Conjunction", date: "2025-12-19", description: "Beautiful pair • Evening twilight", eventType: "conjunction" },
    
    // 2026 events  
    { name: "Jupiter at Opposition", date: "2026-01-10", description: "Best visibility • Mag -2.7", eventType: "opposition" },
    { name: "Mercury Transit", date: "2026-01-13", description: "Mercury crosses the Sun • Rare event", eventType: "transit" },
    { name: "Total Lunar Eclipse", date: "2026-03-03", description: "Visible from Americas, Europe, Africa", eventType: "eclipse" },
    { name: "Annular Solar Eclipse", date: "2026-02-17", description: "Ring of fire • Antarctica, S Atlantic", eventType: "eclipse" },
    { name: "Mars-Jupiter Conjunction", date: "2026-02-25", description: "Bright pair • 0.6° apart", eventType: "conjunction" },
    { name: "Venus Greatest Elongation East", date: "2026-03-18", description: "Evening Star • 46° from Sun", eventType: "elongation" },
    { name: "Total Solar Eclipse", date: "2026-08-12", description: "Visible from Arctic, Greenland, Iceland, Spain", eventType: "eclipse" },
    { name: "Partial Lunar Eclipse", date: "2026-08-28", description: "Visible from E Americas, Europe, Africa, Asia", eventType: "eclipse" },
    { name: "Saturn at Opposition", date: "2026-10-04", description: "Best visibility • Mag +0.3", eventType: "opposition" },
    { name: "Neptune at Opposition", date: "2026-09-24", description: "Best visibility • Telescope required", eventType: "opposition" },
    { name: "Uranus at Opposition", date: "2026-11-23", description: "Best visibility • Binoculars needed", eventType: "opposition" },
    { name: "Mars at Opposition", date: "2026-12-16", description: "Best visibility • Mag -1.6", eventType: "opposition" },
    { name: "Moon occults Mars", date: "2026-12-18", description: "Moon passes in front of Mars", eventType: "occultation" },
  ];

  const result: CelestialEvent[] = [];
  const today = now.getTime();
  const sixtyDaysFromNow = today + 60 * 24 * 60 * 60 * 1000;

  for (const event of events) {
    const eventDate = new Date(event.date);
    const eventTime = eventDate.getTime();
    const daysUntil = Math.ceil((eventTime - today) / (24 * 60 * 60 * 1000));

    // Show events within 60 days (past 2 days to future 60 days)
    if (daysUntil >= -2 && eventTime < sixtyDaysFromNow) {
      let status: "visible" | "soon" | "upcoming" = "upcoming";
      let description = event.description;

      if (daysUntil <= 0 && daysUntil >= -1) {
        status = "visible";
        description = `Tonight! • ${event.description}`;
      } else if (daysUntil <= 3) {
        status = "soon";
        description = `In ${daysUntil} day${daysUntil > 1 ? "s" : ""} • ${event.description}`;
      } else {
        description = `${eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ${event.description}`;
      }

      result.push({
        id: `planet-${event.name.toLowerCase().replace(/\s+/g, "-")}-${event.date}`,
        type: event.eventType === "eclipse" ? "eclipse" : "planet",
        icon: "star",
        title: event.name,
        description,
        status,
        time: eventDate,
      });
    }
  }

  return result;
}

// Format ISS pass for display
function formatISSEvent(pass: VisualPass): CelestialEvent {
  const startTime = new Date(pass.startUTC * 1000);
  const now = new Date();
  const minutesUntil = Math.round((startTime.getTime() - now.getTime()) / 60000);
  
  let status: "visible" | "soon" | "upcoming" = "upcoming";
  let description = "";

  if (minutesUntil <= 5 && minutesUntil >= -pass.duration / 60) {
    status = "visible";
    description = `Visible now! • Mag ${pass.mag.toFixed(1)}`;
  } else if (minutesUntil <= 60) {
    status = "soon";
    const timeStr = startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    description = `${timeStr} • ${Math.round(pass.duration / 60)} min • Mag ${pass.mag.toFixed(1)}`;
  } else {
    const timeStr = startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    description = `${timeStr} • Max ${pass.maxEl}° elevation`;
  }

  return {
    id: `iss-${pass.startUTC}`,
    type: "iss",
    icon: "rocket",
    title: "ISS Flyover",
    description,
    status,
    time: startTime,
  };
}

// Main function to get all tonight's celestial events
export async function getCelestialEvents(lat?: number, lng?: number): Promise<CelestialEvent[]> {
  const events: CelestialEvent[] = [];
  
  // Get meteor showers
  const meteorEvents = getMeteorShowers();
  events.push(...meteorEvents);
  
  // Get planetary events
  const planetEvents = getPlanetaryEvents();
  events.push(...planetEvents);
  
  // Get ISS passes if coordinates provided
  if (lat !== undefined && lng !== undefined) {
    try {
      const issPasses = await fetchISSPasses(lat, lng);
      if (issPasses?.passes) {
        const issEvents = issPasses.passes.slice(0, 3).map(formatISSEvent);
        events.push(...issEvents);
      }
    } catch (error) {
      console.error("Error fetching ISS passes:", error);
    }
  }
  
  // Sort by date, then by status priority: visible > soon > upcoming
  events.sort((a, b) => {
    const statusPriority = { visible: 0, soon: 1, upcoming: 2 };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by date
    const timeA = a.time?.getTime() ?? Infinity;
    const timeB = b.time?.getTime() ?? Infinity;
    return timeA - timeB;
  });
  
  // Return top 10 events for dashboard, full list for events page
  return events;
}

// Export N2YO API key setter for configuration
export function setN2YOApiKey(key: string) {
  (window as any).__N2YO_API_KEY__ = key;
}
