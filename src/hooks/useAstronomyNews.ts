import { useQuery } from "@tanstack/react-query";
import { getSpaceflightNews, getSpaceflightBlogs, getLaunches, NewsArticle } from "@/services/newsApi";

export function useSpaceflightNews(limit = 10) {
  return useQuery<NewsArticle[]>({
    queryKey: ["spaceflight-news", limit],
    queryFn: () => getSpaceflightNews(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

export function useSpaceflightBlogs(limit = 5) {
  return useQuery<NewsArticle[]>({
    queryKey: ["spaceflight-blogs", limit],
    queryFn: () => getSpaceflightBlogs(limit),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export function useUpcomingLaunches(limit = 5) {
  return useQuery({
    queryKey: ["upcoming-launches", limit],
    queryFn: () => getLaunches(limit),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
