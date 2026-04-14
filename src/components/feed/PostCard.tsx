import { useState } from "react";
import { Bookmark, BookmarkCheck, Star, TrendingUp, MapPin, X, SmilePlus, Share, MoreHorizontal } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  isFirst?: boolean;
}

export function PostCard({ post, isFirst = false }: PostCardProps) {
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const { getDistance } = useLocation();

  const { isPostSaved, toggleSavedPost } = useFavorites();
  const { getReaction, setReaction } = useReactions();

  const isSaved = isPostSaved(post.id);
  const userReaction = getReaction(post.id);

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

  const totalReactions = (post.reactions ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0);
  const displayReactions = (post.reactions ?? []).filter(r => (r.count ?? 0) > 0).slice(0, 3);

  const isPopular = post.is_popular || (post as any).establishment?.is_popular;

  const handleReact = (emoji: string) => {
    setReaction(post.id, emoji);
    setTimeout(() => setShowReactions(false), 150);
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

  return (
    <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={() => navigate(`/estabelecimento/${post.establishment_slug}`)}
        >
          <div className="relative">
            <img
              src={post.establishment_avatar || post.image || "/placeholder.svg"}
              alt={post.establishment_name}
              className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
            />
            {isPopular && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-0.5 rounded-full border border-background">
                <TrendingUp className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black leading-tight truncate text-foreground">
              {post.establishment_name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {post.establishment_category}
              </span>
              {hasReviews && (
                <span className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-rating text-rating" />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {rating}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full aspect-square overflow-hidden cursor-pointer group"
        onClick={() => navigate(`/estabelecimento/${post.establishment_slug}`)}
      >
        <img
          src={post.image}
          alt={post.establishment_name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading={isFirst ? "eager" : "lazy"}
        />
        
        {/* Distance Badge Overlay */}
        {distanceLabel && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-white/20 text-[10px] font-black px-2 py-1 gap-1">
              <MapPin className="h-3 w-3" />
              {distanceLabel}
            </Badge>
          </div>
        )}
      </div>

      {/* Caption & Actions */}
      <div className="p-4 space-y-4">
        {post.caption && (
          <p className="text-sm leading-relaxed">
            <span className="font-black text-foreground mr-1.5">{post.establishment_name}</span>
            <span className="text-muted-foreground">{post.caption}</span>
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-90",
              totalReactions > 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
            onClick={() => setShowReactions(true)}
          >
            {totalReactions > 0 ? (
              <>
                <div className="flex -space-x-1">
                  {displayReactions.map((r) => (
                    <span key={r.emoji} className="text-sm">{r.emoji}</span>
                  ))}
                </div>
                <span className="text-xs font-black">+{totalReactions}</span>
              </>
            ) : (
              <>
                <SmilePlus className="w-4 h-4" />
                <span className="text-xs font-black">Reagir</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              className="p-2.5 hover:bg-secondary rounded-full transition-all active:scale-90"
              onClick={handleShare}
            >
              <Share className="w-5 h-5 text-foreground" />
            </button>
            <button
              className="p-2.5 hover:bg-secondary rounded-full transition-all active:scale-90"
              onClick={() => isSaved ? toggleSavedPost(post.id) : setShowSave(true)}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
              ) : (
                <Bookmark className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      <SaveSheet
        open={showSave}
        onOpenChange={setShowSave}
        itemName={post.establishment_name}
        onSaved={() => toggleSavedPost(post.id)}
      />

      {/* Reaction Modal */}
      {showReactions && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowReactions(false)}
        >
          <div
            className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-border/50 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-black tracking-tight">O que achou?</h4>
              <button
                onClick={() => setShowReactions(false)}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {CANONICAL_REACTIONS.map((item) => {
                const isActive = userReaction === item.emoji;
                const count = (post.reactions ?? []).find((r) => r.emoji === item.emoji)?.count ?? 0;
                return (
                  <button
                    key={item.emoji}
                    onClick={() => handleReact(item.emoji)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-75",
                      isActive ? "bg-primary/10 ring-2 ring-primary/20 scale-110" : "hover:bg-secondary"
                    )}
                  >
                    <span className="text-3xl animate-in zoom-in duration-300">{item.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{item.label}</span>
                    {count > 0 && <span className="text-[10px] font-bold text-primary">{count}</span>}
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
