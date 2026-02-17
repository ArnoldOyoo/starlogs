import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Loader2 } from "lucide-react";
import { NasaImage } from "@/hooks/useNasaGallery";
import { ImageCard } from "./ImageCard";
import { ImageDetailDialog } from "./ImageDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";

type ImageSize = "normal" | "tall" | "wide" | "large";

// Deterministic size pattern that creates the masonry look
function getImageSize(index: number): ImageSize {
  const pattern: ImageSize[] = [
    "wide", "normal", "normal",       // row 1: one wide + two normal
    "normal", "tall", "normal",       // row 2: normal + tall spanning
    "normal", "normal", "wide",       // row 3: two normal + wide
    "large", "normal", "normal",      // row 4: one large + normals
    "normal", "normal", "normal",     // row 5: three normal
    "normal", "wide", "normal",       // row 6
  ];
  return pattern[index % pattern.length];
}

function MasonrySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-2">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = getImageSize(i);
        const spanClasses = {
          normal: "col-span-1 row-span-1",
          tall: "col-span-1 row-span-2",
          wide: "col-span-2 row-span-1",
          large: "col-span-2 row-span-2",
        };
        return (
          <div key={i} className={spanClasses[size]}>
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        );
      })}
    </div>
  );
}

interface MasonryGridProps {
  images: NasaImage[];
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  emptyMessage: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (image: NasaImage) => void;
}

export function MasonryGrid({
  images,
  isLoading,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  emptyMessage,
  emptyIcon: EmptyIcon = Camera,
  isFavorite,
  onToggleFavorite,
}: MasonryGridProps) {
  const [selectedImage, setSelectedImage] = useState<NasaImage | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !fetchNextPage) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "300px",
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver, fetchNextPage]);

  if (isLoading && images.length === 0) {
    return <MasonrySkeleton />;
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <EmptyIcon className="w-12 h-12 mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    if (selectedImage) {
      onToggleFavorite(selectedImage);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-2">
        {images.map((image, index) => (
          <ImageCard
            key={`${image.id}-${index}`}
            image={image}
            onClick={() => setSelectedImage(image)}
            isFavorite={isFavorite(image.id)}
            onToggleFavorite={() => onToggleFavorite(image)}
            size={getImageSize(index)}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {fetchNextPage && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more images...</span>
            </div>
          )}
          {!hasNextPage && images.length > 0 && (
            <p className="text-muted-foreground text-sm">You've reached the end</p>
          )}
        </div>
      )}

      <ImageDetailDialog
        image={selectedImage}
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        isFavorite={selectedImage ? isFavorite(selectedImage.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </>
  );
}
