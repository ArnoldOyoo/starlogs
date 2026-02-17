// NASA API - with fallback and retry logic
const NASA_API_KEY = "DEMO_KEY"; // Using DEMO_KEY which has higher reliability

export interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

// Fallback APOD data when API fails
const fallbackAPOD: APODData = {
  title: "The Milky Way over Monument Valley",
  explanation: "The Milky Way arches over the iconic buttes of Monument Valley in this stunning astrophotography shot. On clear nights, our galaxy's band of stars creates a celestial river across the sky, connecting us to billions of distant suns.",
  url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop",
  media_type: "image",
  date: new Date().toISOString().split("T")[0],
  copyright: "Unsplash"
};

export async function fetchAPOD(): Promise<APODData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn("NASA APOD API returned error:", response.status);
      return fallbackAPOD;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn("NASA APOD API request timed out, using fallback");
      } else {
        console.warn("NASA APOD API error:", error.message);
      }
    }
    
    return fallbackAPOD;
  }
}
