import { useState } from "react";
import { Heart, ImageOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NasaImage } from "@/hooks/useNasaGallery";

interface ImageCardProps {
  image: NasaImage;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  size?: "normal" | "tall" | "wide" | "large";
}

export function ImageCard({ image, onClick, isFavorite, onToggleFavorite, size = "normal" }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const sizeClasses = {
    normal: "col-span-1 row-span-1",
    tall: "col-span-1 row-span-2",
    wide: "col-span-2 row-span-1",
    large: "col-span-2 row-span-2",
  };

  const aspectClasses = {
    normal: "aspect-square",
    tall: "aspect-[3/5]",
    wide: "aspect-[2/1]",
    large: "aspect-square",
  };

  return (
    <div
      className={cn(
        "group cursor-pointer overflow-hidden rounded-lg relative",
        sizeClasses[size]
      )}
      onClick={onClick}
    >
      <div className={cn("relative w-full h-full min-h-[180px] bg-muted/20", aspectClasses[size])}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <ImageOff className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">Failed to load</span>
          </div>
        ) : (
          <img
            src={image.thumbnailUrl}
            alt={image.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100",
            isFavorite
              ? "bg-primary/90 text-primary-foreground opacity-100"
              : "bg-black/40 text-white hover:bg-black/60"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>

        {/* Title on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-lg">{image.title}</p>
        </div>
      </div>
    </div>
  );
}
