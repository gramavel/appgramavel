import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Star, TrendingUp, MapPin, X, SmilePlus, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SaveSheet } from "@/components/SaveSheet";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useReactions } from "@/contexts/ReactionsContext";
import { useLocation } from "@/contexts/LocationContext";
import { CANONICAL_REACTIONS } from "@/lib/constants";
import { toast } from "sonner";
import type { Post } from "@/data/mock";

interface PostCardProps {
  post: Post;
  isFirst?: boolean;
}

export function PostCard({ post, isFirst = false }: PostCardProps) {
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const { getDistance } = useLocation();

  const { isPlaceSaved, toggleSavedPlace } = useFavorites();
  const { getReaction, setReaction, getCounts, setInitialCounts } = useReactions();

  // Use establishment_id from post for favorites
  const establishmentId = (post as any).establishment_id || (post as any).establishment?.id;
  const isSaved = establishmentId ? isPlaceSaved(establishmentId) : false;
  const userReaction = getReaction(post.id);
  
  // Sync initial counts from post data to context
  useEffect(() => {
    if (post.reactions) {
      setInitialCounts(post.id, post.reactions as Array<{ emoji: string, count: number }>);
    }
  }, [post.id, post.reactions, setInitialCounts]);

  const currentCounts = getCounts(post.id);
  const totalReactions = currentCounts.reduce((sum, r) => sum + (r.count ?? 0), 0);
  const displayReactions = currentCounts.filter(r => (r.count ?? 0) > 0).slice(0, 3);

  const rating = (post as any).establishment?.rating ?? post.rating ?? 0;
  const totalReviews = (post as any).establishment?.total_reviews ?? post.total_reviews ?? 0;
  const hasReviews = totalReviews > 0;

  const distanceLabel = (() => {
    const est = (post as any).establishment;
    const lat = est?.latitude ?? (post as any).latitude;
    const lng = est?.longitude ?? (post as any).longitude;
    if (lat && lng) {
      const real = getDistance(Number(lat), Number(lng));
      if (real) return real;
    }
    const fallback = est?.distance_km ?? post.distance_km;
    return fallback ? `${Number(fallback).toFixed(1)} km` : null;
  })();

  const isPopular = post.is_popular || (post as any).establishment?.is_popular;

  const handleReact = (emoji: string) => {
    setReaction(post.id, emoji);
    // Small delay to show animation before closing
    setTimeout(() => setShowReactions(false), 100);
  };

  const handleShare = async () => {
    const slug = post.establishment_slug ?? (post as any).establishment?.slug;
    const url = `${window.location.origin}/estabelecimento/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.establishment_name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const handleToggleSave = async () => {
    if (!establishmentId) return;
    if (isSaved) {
      await toggleSavedPlace(establishmentId);
      toast.success("Removido dos favoritos");
    } else {
      setShowSave(true);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header — avatar + name/rating only, no bookmark here */}
      <div className="flex items-center p-4">
        <div
          className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
          onClick={() => navigate(`/estabelecimento/${post.establishment_slug}`)}
        >
          <img
            src={post.establishment_avatar || post.image || "/placeholder.svg"}
            alt={post.establishment_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-border shrink-0"
            width={48}
            height={48}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight truncate">{post.establishment_name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {post.establishment_category}
              </Badge>
              {hasReviews ? (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-rating text-rating" />
                  <span className="text-xs text-muted-foreground">
                    {rating} ({totalReviews})
                  </span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/60">Novo</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tags row */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPopular && (
            <Badge variant="default" className="text-xs px-2.5 py-0.5 gap-1">
              <TrendingUp className="h-3 w-3" />
              Popular esta semana
            </Badge>
          )}
        </div>
        {distanceLabel && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {distanceLabel}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="w-full aspect-[4/5] overflow-hidden">
        <img
          src={post.image}
          alt={post.establishment_name}
          className="w-full h-full object-cover"
          width={800}
          height={1000}
          loading={isFirst ? "eager" : "lazy"}
          {...(isFirst ? { fetchPriority: "high" as const } : {})}
        />
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="p-4 pb-2 space-y-2">
          <p className="text-sm">
            <span className="font-semibold">{post.establishment_name}</span>
            {" · "}
            <span className="text-muted-foreground">{post.caption}</span>
          </p>
        </div>
      )}

      {/* Actions row: reactions left, bookmark + share right */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        <button
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-all active:scale-95"
          onClick={() => setShowReactions(true)}
          aria-label="Reagir ao post"
        >
          {totalReactions > 0 ? (
            <>
              <div className="flex -space-x-1">
                {displayReactions.map((r) => (
                  <span
                    key={r.emoji}
                    className={`text-sm ${userReaction === r.emoji ? "scale-110" : ""} transition-transform`}
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>
              <span className="text-xs text-foreground/70 ml-0.5">+{totalReactions}</span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <SmilePlus className="w-3.5 h-3.5" />
              Reagir
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-secondary rounded-full transition-colors active:scale-95"
            onClick={handleShare}
            aria-label="Compartilhar"
          >
            <Share className="w-5 h-5" />
          </button>
          <button
            className="p-2 hover:bg-secondary rounded-full transition-colors active:scale-95"
            onClick={handleToggleSave}
            aria-label="Salvar lugar"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <SaveSheet
        open={showSave}
        onOpenChange={setShowSave}
        itemName={post.establishment_name}
        establishmentId={establishmentId}
      />

      {/* Reaction Modal */}
      {showReactions && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowReactions(false)}
          role="dialog"
          aria-label="Escolher reação"
        >
          <div
            className="w-full max-w-md bg-card rounded-t-2xl border-t border-border p-4 pb-24 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground">Reagir</h4>
              <button
                onClick={() => setShowReactions(false)}
                className="p-2 rounded-full hover:bg-secondary"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex justify-around">
              {CANONICAL_REACTIONS.map((item) => {
                const isActive = userReaction === item.emoji;
                const count = currentCounts.find((r) => r.emoji === item.emoji)?.count ?? 0;
                return (
                  <button
                    key={item.emoji}
                    onClick={() => handleReact(item.emoji)}
                    className={`flex flex-col items-center gap-1 p-4 rounded-lg transition-all min-w-[48px] min-h-[48px] active:scale-75 ${
                      isActive ? "bg-primary/10 scale-110 animate-pulse" : "hover:bg-secondary hover:scale-110"
                    }`}
                    aria-label={`Reagir com ${item.label}`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
