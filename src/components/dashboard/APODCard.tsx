import { useState } from "react";
import { ImageOff } from "lucide-react";

interface APODCardProps {
  title: string;
  description: string;
  imageUrl: string;
  date?: string;
  copyright?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop";

export function APODCard({ title, description, imageUrl, date, copyright }: APODCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_IMAGE) {
      setImgSrc(FALLBACK_IMAGE);
      setHasError(true);
    }
  };

  return (
    <div className="glass-card card-glow rounded-xl overflow-hidden">
      <div className="relative h-48">
        {hasError && !imgSrc ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageOff className="w-12 h-12 text-muted-foreground" />
          </div>
        ) : (
          <img 
            src={imgSrc} 
            alt={title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="text-[10px] uppercase tracking-wider bg-muted/80 text-muted-foreground px-2 py-1 rounded-full backdrop-blur-sm">
            NASA APOD
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
              Featured
            </span>
            {date && (
              <span className="text-[10px] text-muted-foreground">
                • {date}
              </span>
            )}
          </div>
          <h4 className="font-display font-bold text-foreground mt-1 line-clamp-1">{title}</h4>
        </div>
      </div>
      <div className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        {copyright && (
          <p className="text-[10px] text-muted-foreground/70 mt-2">
            © {copyright}
          </p>
        )}
      </div>
    </div>
  );
}