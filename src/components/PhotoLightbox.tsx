import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: string[];
  initialIndex?: number;
  altPrefix?: string;
}

export function PhotoLightbox({
  open,
  onOpenChange,
  photos,
  initialIndex = 0,
  altPrefix = "Observation photo",
}: PhotoLightboxProps) {
  const safeInitial = useMemo(() => {
    if (!photos.length) return 0;
    return Math.min(Math.max(0, initialIndex), photos.length - 1);
  }, [photos.length, initialIndex]);

  const [index, setIndex] = useState(safeInitial);

  useEffect(() => {
    if (open) setIndex(safeInitial);
  }, [open, safeInitial]);

  const hasMany = photos.length > 1;

  const goPrev = useCallback(() => {
    if (!photos.length) return;
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    if (!photos.length) return;
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, goPrev, goNext]);

  const current = photos[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 bg-card border-border">
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="bg-background/40 hover:bg-background/60"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {hasMany && (
            <>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goPrev}
                  aria-label="Previous photo"
                  className="bg-background/40 hover:bg-background/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goNext}
                  aria-label="Next photo"
                  className="bg-background/40 hover:bg-background/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          <div className="bg-background/30">
            {current ? (
              <img
                src={current}
                alt={`${altPrefix} ${index + 1} of ${photos.length}`}
                className="w-full max-h-[80vh] object-contain"
                loading="eager"
              />
            ) : (
              <div className="w-full h-[60vh] flex items-center justify-center text-muted-foreground">
                No photo
              </div>
            )}
          </div>

          {photos.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
              <p className="text-sm text-muted-foreground">
                {index + 1} / {photos.length}
              </p>
              <div className="flex gap-2">
                {hasMany && (
                  <>
                    <Button variant="outline" onClick={goPrev} className="border-border">
                      Previous
                    </Button>
                    <Button variant="outline" onClick={goNext} className="border-border">
                      Next
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
