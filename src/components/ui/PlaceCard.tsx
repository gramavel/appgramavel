import { Star, MapPin, TrendingUp, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";

interface PlaceCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  slug: string;
  rating?: number;
  totalReviews?: number;
  distance?: string | number;
  isPopular?: boolean;
  variant?: "horizontal" | "vertical" | "compact";
  className?: string;
}

export function PlaceCard({
  id,
  name,
  category,
  image,
  slug,
  rating = 0,
  totalReviews = 0,
  distance,
  isPopular = false,
  variant = "vertical",
  className,
}: PlaceCardProps) {
  const navigate = useNavigate();
  const { isPostSaved, toggleSavedPost } = useFavorites();
  const isSaved = isPostSaved(id);

  const handleClick = () => navigate(`/estabelecimento/${slug}`);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedPost(id);
  };

  if (variant === "compact") {
    return (
      <Card
        onClick={handleClick}
        className={cn(
          "flex gap-3 p-3 cursor-pointer hover:shadow-card-hover transition-all active:scale-[0.98] border-border/50",
          className
        )}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-bold text-sm leading-tight truncate">{name}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">{category}</p>
          <div className="flex items-center gap-3 mt-1">
            {totalReviews > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-rating text-rating" />
                <span className="text-[11px] font-semibold">{rating}</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60">Novo</span>
            )}
            {distance && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "horizontal") {
    return (
      <Card
        onClick={handleClick}
        className={cn(
          "shrink-0 w-[260px] overflow-hidden cursor-pointer hover:shadow-card-hover transition-all active:scale-[0.98] border-border/50",
          className
        )}
      >
        <div className="aspect-[16/10] relative overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          {isPopular && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-white border-0 text-[10px] px-2 py-0.5 gap-1 shadow-lg">
                <TrendingUp className="w-3 h-3" />
                Em alta
              </Badge>
            </div>
          )}
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 fill-white" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-sm leading-tight truncate">{name}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">{category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {totalReviews > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-rating text-rating" />
                <span className="text-[11px] font-semibold">{rating}</span>
                <span className="text-[11px] text-muted-foreground">({totalReviews})</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60">Novo</span>
            )}
            {distance && (
              <div className="flex items-center gap-1 ml-auto">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-card-hover transition-all active:scale-[0.99] border-border/50",
        className
      )}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {isPopular && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-white border-0 text-xs px-2.5 py-1 gap-1.5 shadow-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              Popular agora
            </Badge>
          </div>
        )}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 fill-white" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-base leading-tight truncate">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {category}
              </span>
              {distance && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance}
                </span>
              )}
            </div>
          </div>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <span className="text-sm font-bold">{rating}</span>
            </div>
          ) : (
            <Badge variant="secondary" className="text-[10px]">Novo</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
