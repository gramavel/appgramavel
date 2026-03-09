import { Bookmark, Star, TrendingUp, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Post } from "@/data/mock";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);

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
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {post.rating} ({post.total_reviews})
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-secondary rounded-full transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      <Separator />

      {/* Tags */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {post.establishment_category}
        </Badge>
        {post.is_popular && (
          <div className="flex items-center gap-1 text-[10px] text-primary font-medium shrink-0">
            <TrendingUp className="w-3 h-3" />
            Popular esta semana
          </div>
        )}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 ml-auto">
          <MapPin className="w-3 h-3" />
          {post.distance_km.toFixed(1)} km
        </div>
      </div>

      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={post.image}
          alt={post.establishment_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div className="p-3">
        <p className="text-sm">
          <span className="font-semibold">{post.establishment_name}</span>{" "}
          <span className="text-muted-foreground">{post.caption}</span>
        </p>
      </div>

      {/* Reactions - simplified */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-1">
          {post.reactions.slice(0, 3).map((r) => (
            <span key={r.emoji} className="text-sm">{r.emoji}</span>
          ))}
          <span className="text-xs text-muted-foreground ml-1">+{totalReactions}</span>
        </div>
        <div className="flex items-center -space-x-2">
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
    </div>
  );
}
