import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

const NASA_API_KEY = "DEMO_KEY";

export interface NasaImage {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  date: string;
  center?: string;
  keywords?: string[];
}

interface NasaSearchResult {
  collection: {
    items: {
      data: {
        title: string;
        description: string;
        date_created: string;
        nasa_id: string;
        center?: string;
        keywords?: string[];
        media_type: string;
      }[];
      links?: {
        href: string;
        rel: string;
      }[];
    }[];
    metadata: {
      total_hits: number;
    };
  };
}

export const SEARCH_TOPICS = [
  "nebula",
  "galaxy",
  "jupiter",
  "saturn",
  "mars",
  "supernova",
  "black hole",
  "hubble",
  "james webb",
  "solar eclipse",
];

const PAGE_SIZE = 24;

function parseNasaImages(data: NasaSearchResult): NasaImage[] {
  return data.collection.items
    .filter((item) => item.links && item.links.length > 0)
    .map((item) => ({
      id: item.data[0].nasa_id,
      title: item.data[0].title,
      description: item.data[0].description || "",
      url: item.links?.[0]?.href?.replace("~thumb", "~medium") || "",
      thumbnailUrl: item.links?.[0]?.href || "",
      date: item.data[0].date_created,
      center: item.data[0].center,
      keywords: item.data[0].keywords,
    }));
}

async function fetchNasaImagesPage(query: string, page: number): Promise<{ images: NasaImage[]; hasMore: boolean; totalHits: number }> {
  const response = await fetch(
    `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page=${page}&page_size=${PAGE_SIZE}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch NASA images");
  }

  const data: NasaSearchResult = await response.json();
  const images = parseNasaImages(data);
  const totalHits = data.collection.metadata.total_hits;
  const hasMore = page * PAGE_SIZE < totalHits && images.length === PAGE_SIZE;

  return { images, hasMore, totalHits };
}

// Fetch mixed images from multiple topics, shuffled together
async function fetchMixedTopicsPage(page: number): Promise<{ images: NasaImage[]; hasMore: boolean; totalHits: number }> {
  // Pick 3 random topics per page for variety
  const shuffledTopics = [...SEARCH_TOPICS].sort(() => Math.random() - 0.5);
  const selectedTopics = shuffledTopics.slice(0, 3);

  const results = await Promise.all(
    selectedTopics.map((topic) =>
      fetchNasaImagesPage(topic, page).catch(() => ({ images: [], hasMore: false, totalHits: 0 }))
    )
  );

  // Interleave images from different topics for variety
  const allImages: NasaImage[] = [];
  const maxLen = Math.max(...results.map((r) => r.images.length));

  for (let i = 0; i < maxLen; i++) {
    for (const result of results) {
      if (i < result.images.length) {
        allImages.push(result.images[i]);
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  const uniqueImages = allImages.filter((img) => {
    if (seen.has(img.id)) return false;
    seen.add(img.id);
    return true;
  });

  const hasMore = results.some((r) => r.hasMore);
  const totalHits = results.reduce((sum, r) => sum + r.totalHits, 0);

  return { images: uniqueImages, hasMore, totalHits };
}

export function useNasaMixedGallery() {
  return useInfiniteQuery({
    queryKey: ["nasa-mixed-gallery"],
    queryFn: ({ pageParam = 1 }) => fetchMixedTopicsPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPageParam + 1 : undefined;
    },
    staleTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useNasaSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ["nasa-search", query],
    queryFn: ({ pageParam = 1 }) => fetchNasaImagesPage(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPageParam + 1 : undefined;
    },
    staleTime: 10 * 60 * 1000,
    enabled: query.length > 0,
  });
}

export function useNasaFeaturedInfinite(topic: string) {
  return useInfiniteQuery({
    queryKey: ["nasa-featured-infinite", topic],
    queryFn: ({ pageParam = 1 }) => fetchNasaImagesPage(topic, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPageParam + 1 : undefined;
    },
    staleTime: 30 * 60 * 1000,
    enabled: topic.length > 0,
  });
}
