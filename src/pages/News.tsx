import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { Newspaper, ExternalLink, Rocket, Clock, RefreshCw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpaceflightNews, useSpaceflightBlogs, useUpcomingLaunches } from "@/hooks/useAstronomyNews";
import { formatDistanceToNow, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { LaunchDetailsDialog } from "@/components/LaunchDetailsDialog";
import type { UpcomingLaunch } from "@/services/newsApi";

function NewsCard({ article }: { article: any }) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
  
  return (
    <a 
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card card-glow rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group block"
    >
      {article.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            {article.source}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo}
          </span>
        </div>
        <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
        <div className="flex items-center gap-1 text-primary text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Read more <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </a>
  );
}

interface LaunchCardProps {
  launch: UpcomingLaunch;
  onClick: () => void;
}

function LaunchCard({ launch, onClick }: LaunchCardProps) {
  const launchDate = launch.net ? new Date(launch.net) : null;
  const providerName = launch.launch_service_provider?.abbrev || launch.launch_service_provider?.name || "Unknown";
  const rocketName = launch.rocket?.configuration?.name || "Rocket";
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      {launch.image ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={launch.image} 
            alt={launch.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-5 h-5 text-orange-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground text-sm truncate">
          {launch.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {providerName} • {rocketName}
        </p>
        {launchDate && (
          <p className="text-xs text-primary mt-1">
            {format(launchDate, "MMM d, yyyy 'at' HH:mm")} UTC
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
            {launch.status?.abbrev || "TBD"}
          </span>
        </div>
      </div>
    </button>
  );
}

function NewsCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function News() {
  const { data: news, isLoading: newsLoading, refetch: refetchNews } = useSpaceflightNews(12);
  const { data: blogs, isLoading: blogsLoading } = useSpaceflightBlogs(5);
  const { data: launches, isLoading: launchesLoading } = useUpcomingLaunches(5);
  
  const [selectedLaunch, setSelectedLaunch] = useState<UpcomingLaunch | null>(null);
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);

  const handleLaunchClick = (launch: UpcomingLaunch) => {
    setSelectedLaunch(launch);
    setLaunchDialogOpen(true);
  };

  const featuredArticle = news?.[0];
  const restNews = news?.slice(1) || [];

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Astronomy News
            </h1>
            <p className="text-muted-foreground">
              Latest news from space agencies and astronomy sources worldwide
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-border bg-card"
            onClick={() => refetchNews()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Article */}
            {newsLoading ? (
              <div className="glass-card card-glow rounded-xl overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-6 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : featuredArticle && (
              <a 
                href={featuredArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card card-glow rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group block"
              >
                {featuredArticle.imageUrl && (
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={featuredArticle.imageUrl} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      Featured
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {featuredArticle.source}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(featuredArticle.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {featuredArticle.summary}
                  </p>
                  <div className="flex items-center gap-1 text-primary text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read full article <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            )}

            {/* News Grid */}
            <div>
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Latest Headlines
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsLoading ? (
                  Array(4).fill(0).map((_, i) => <NewsCardSkeleton key={i} />)
                ) : (
                  restNews.slice(0, 6).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Launches */}
            <div className="glass-card card-glow rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-orange-500" />
                <h3 className="font-display font-semibold text-foreground">
                  Upcoming Launches
                </h3>
              </div>
              
              <div className="space-y-3">
                {launchesLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))
                ) : launches?.length ? (
                  launches.map((launch: UpcomingLaunch) => (
                    <LaunchCard 
                      key={launch.id} 
                      launch={launch} 
                      onClick={() => handleLaunchClick(launch)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming launches found
                  </p>
                )}
              </div>
            </div>

            {/* Blog Posts */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <h3 className="font-display font-semibold text-foreground">
                  Featured Blogs
                </h3>
              </div>
              
              <div className="space-y-4">
                {blogsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                ) : blogs?.length ? (
                  blogs.map((blog) => (
                    <a
                      key={blog.id}
                      href={blog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {blog.source} • {formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true })}
                      </p>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No blogs found
                  </p>
                )}
              </div>
            </div>

            {/* Live Status */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-foreground">Live Updates</span>
              </div>
              <p className="text-xs text-muted-foreground">
                News automatically refreshes every 10 minutes. Click refresh for the latest updates.
              </p>
            </div>
          </div>
        </div>

        <Footer />
        
        <LaunchDetailsDialog 
          launch={selectedLaunch}
          open={launchDialogOpen}
          onOpenChange={setLaunchDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
