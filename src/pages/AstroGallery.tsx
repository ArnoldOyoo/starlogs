import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { useNasaMixedGallery, useNasaSearch, NasaImage } from "@/hooks/useNasaGallery";
import { useFavorites } from "@/hooks/useFavorites";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";

export default function AstroGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const mixedResult = useNasaMixedGallery();
  const searchResult = useNasaSearch(activeSearch);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const mixedImages = mixedResult.data?.pages.flatMap((page) => page.images) || [];
  const searchImages = searchResult.data?.pages.flatMap((page) => page.images) || [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleFavorite = (image: NasaImage) => {
    const added = toggleFavorite(image);
    if (added) {
      toast.success("Added to favorites", {
        description: image.title,
        icon: <Heart className="w-4 h-4 fill-current text-primary" />,
      });
    } else {
      toast("Removed from favorites", {
        description: image.title,
      });
    }
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Astro Gallery</h1>
              <p className="text-muted-foreground">
                Explore stunning astronomy and space photos from NASA
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card card-glow rounded-xl p-4 mb-6">
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Search NASA images... (e.g., nebula, mars, hubble)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-background/50 border-border"
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()} className="bg-primary hover:bg-primary/90">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeSearch ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Results for "<span className="text-primary">{activeSearch}</span>"
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setActiveSearch("")} className="text-muted-foreground hover:text-foreground">
                Clear search
              </Button>
            </div>
            <MasonryGrid
              images={searchImages}
              isLoading={searchResult.isLoading}
              isFetchingNextPage={searchResult.isFetchingNextPage}
              hasNextPage={searchResult.hasNextPage}
              fetchNextPage={searchResult.fetchNextPage}
              emptyMessage="No images found for your search"
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        ) : (
          <Tabs defaultValue="explore" className="space-y-6">
            <TabsList className="glass-card border border-border/50 p-1">
              <TabsTrigger value="explore" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
                {favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-muted/50 text-xs">
                    {favorites.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="space-y-4">
              <MasonryGrid
                images={mixedImages}
                isLoading={mixedResult.isLoading}
                isFetchingNextPage={mixedResult.isFetchingNextPage}
                hasNextPage={mixedResult.hasNextPage}
                fetchNextPage={mixedResult.fetchNextPage}
                emptyMessage="No images available"
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Your saved astronomy images ({favorites.length} {favorites.length === 1 ? "image" : "images"})
                </p>
              </div>
              <MasonryGrid
                images={favorites}
                isLoading={false}
                emptyMessage="No favorites yet. Click the heart icon on any image to save it here."
                emptyIcon={Heart}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </TabsContent>
          </Tabs>
        )}

        <Footer />
      </div>
    </MainLayout>
  );
}
