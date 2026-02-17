import { useState } from "react";
import { Newspaper, ExternalLink, Clock, ImageOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NewsArticle } from "@/services/newsApi";

interface FeaturedNewsCardProps {
  article: NewsArticle;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop";

export function FeaturedNewsCard({ article }: FeaturedNewsCardProps) {
  const [imgSrc, setImgSrc] = useState(article.imageUrl || FALLBACK_IMAGE);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <div className="glass-card card-glow rounded-xl overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        {hasError && !imgSrc ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageOff className="w-12 h-12 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-primary-foreground text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Newspaper className="w-3 h-3" />
            Featured
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {article.source}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline flex items-center gap-1"
          >
            Read More <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
