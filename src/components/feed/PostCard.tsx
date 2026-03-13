import { useState } from "react";
import { Bookmark, Star, TrendingUp, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Post } from "@/data/mock";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = post.reactions.slice(0, 3);

  const handleReact = (emoji: string) => {
    setUserReaction(userReaction === emoji ? null : emoji);
    setShowReactions(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/estabelecimento/${post.establishment_slug}`)}
        >
          <img
            src={post.establishment_avatar}
            alt={post.establishment_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
          />
          <div>
            <h3 className="text-sm font-semibold leading-tight">{post.establishment_name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                {post.establishment_category}
              </Badge>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {post.rating} ({post.total_reviews})
                </span>
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-secondary rounded-full transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      <Separator />

      {/* Tags row */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.is_popular && (
            <Badge variant="default" className="text-[11px] px-2.5 py-0.5 gap-1">
              <TrendingUp className="h-3 w-3" />
              Popular esta semana
            </Badge>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {post.distance_km.toFixed(1)} km
        </span>
      </div>

      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={post.image}
          alt={post.establishment_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div className="p-3 space-y-2">
        <p className="text-sm">
          <span className="font-semibold">{post.establishment_name}</span>
          {" · "}
          <span className="text-muted-foreground">{post.caption}</span>
        </p>
      </div>

      {/* Reactions */}
      <div className="flex items-center justify-between px-3 pb-3">
        <button
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          onClick={() => setShowReactions(true)}
        >
          {displayReactions.map((r) => (
            <span
              key={r.emoji}
              className={`text-lg ${userReaction === r.emoji ? "scale-125" : ""} transition-transform`}
            >
              {r.emoji}
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-1">+{totalReactions}</span>
        </button>
        <div className="flex -space-x-2">
          {post.recent_users.slice(0, 3).map((u, i) => (
            <img
              key={i}
              src={u.avatar}
              alt=""
              className="w-6 h-6 rounded-full border-2 border-card object-cover"
            />
          ))}
        </div>
      </div>

      {/* Reaction Modal */}
      {showReactions && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowReactions(false)}
        >
          <div
            className="w-full max-w-md bg-card rounded-t-2xl border-t border-border p-4 pb-8 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground">Reagir</h4>
              <button
                onClick={() => setShowReactions(false)}
                className="p-1 rounded-full hover:bg-secondary"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex justify-around">
              {post.reactions.map((r) => {
                const isActive = userReaction === r.emoji;
                return (
                  <button
                    key={r.emoji}
                    onClick={() => handleReact(r.emoji)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      isActive ? "bg-primary/10 scale-110" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{r.count}</span>
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
