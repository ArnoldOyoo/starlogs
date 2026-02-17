import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, ExternalLink, Heart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NasaImage } from "@/hooks/useNasaGallery";

interface ImageDetailDialogProps {
  image: NasaImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ImageDetailDialog({ image, open, onOpenChange, isFavorite, onToggleFavorite }: ImageDetailDialogProps) {
  if (!image) return null;

  const formattedDate = (() => {
    try {
      return format(new Date(image.date), "MMMM d, yyyy");
    } catch {
      return image.date;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden glass-card border-border">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto md:h-full bg-background/50">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-contain"
            />
          </div>
          <ScrollArea className="max-h-[50vh] md:max-h-[80vh]">
            <div className="p-6 space-y-4">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-xl text-foreground font-display">{image.title}</DialogTitle>
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleFavorite}
                    className={cn(
                      "shrink-0",
                      isFavorite && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    <Heart className={cn("w-4 h-4 mr-1", isFavorite && "fill-current")} />
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="gap-1 bg-muted/50">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </Badge>
                  {image.center && (
                    <Badge variant="outline" className="gap-1 border-border">
                      <Building2 className="w-3 h-3" />
                      {image.center}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                {image.description}
              </DialogDescription>
              {image.keywords && image.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {image.keywords.slice(0, 8).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs bg-muted/50">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4 border-border hover:bg-muted"
                onClick={() => window.open(image.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Resolution
              </Button>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
