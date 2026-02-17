// NASA RSS feeds and Spaceflight News API for astronomy news

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
}

// Spaceflight News API - free, no API key required
const SPACEFLIGHT_API = "https://api.spaceflightnewsapi.net/v4";

export async function getSpaceflightNews(limit = 10): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${SPACEFLIGHT_API}/articles/?limit=${limit}&ordering=-published_at`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch spaceflight news");
    }
    
    const data = await response.json();
    
    return data.results.map((article: any) => ({
      id: article.id.toString(),
      title: article.title,
      summary: article.summary,
      url: article.url,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      source: article.news_site,
    }));
  } catch (error) {
    console.error("Error fetching spaceflight news:", error);
    return [];
  }
}

export async function getSpaceflightBlogs(limit = 5): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${SPACEFLIGHT_API}/blogs/?limit=${limit}&ordering=-published_at`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }
    
    const data = await response.json();
    
    return data.results.map((blog: any) => ({
      id: blog.id.toString(),
      title: blog.title,
      summary: blog.summary,
      url: blog.url,
      imageUrl: blog.image_url,
      publishedAt: blog.published_at,
      source: blog.news_site,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export interface UpcomingLaunch {
  id: string;
  name: string;
  net: string; // NET (No Earlier Than) date
  status: {
    name: string;
    abbrev: string;
  };
  rocket?: {
    configuration?: {
      name: string;
      family: string;
    };
  };
  launch_service_provider?: {
    name: string;
    abbrev: string;
  };
  pad?: {
    name: string;
    location?: {
      name: string;
    };
  };
  image?: string;
  webcast_live?: boolean;
  vidURLs?: Array<{
    url: string;
    title: string;
  }>;
}

// Launch Library 2 API for upcoming launches (via Spaceflight News API proxy)
const LAUNCH_API = "https://ll.thespacedevs.com/2.2.0";

export async function getLaunches(limit = 5): Promise<UpcomingLaunch[]> {
  try {
    // Fetch upcoming launches - only future launches
    const response = await fetch(
      `${LAUNCH_API}/launch/upcoming/?limit=${limit}&mode=list&ordering=net`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch upcoming launches");
    }
    
    const data = await response.json();
    
    // Filter to only show launches in the future
    const now = new Date();
    return (data.results || [])
      .filter((launch: UpcomingLaunch) => new Date(launch.net) > now)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching upcoming launches:", error);
    return [];
  }
}
