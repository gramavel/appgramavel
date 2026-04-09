import { useState, useEffect } from "react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { PostCard } from "@/components/feed/PostCard";
import { ProximityCheckinCard } from "@/components/feed/ProximityCheckinCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getPosts } from "@/services/posts";
import type { Post } from "@/data/mock";

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCheckin, setShowCheckin] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then(({ data }) => {
      if (data && data.length > 0) {
        const mapped: Post[] = data.map((p: any) => ({
          id: p.id,
          image: p.image || "",
          caption: p.caption || "",
          establishment_id: p.establishment?.id || p.establishment_id,
          establishment_name: p.establishment?.name || "",
          establishment_slug: p.establishment?.slug || "",
          establishment_category: p.establishment?.category || "",
          establishment_avatar: p.establishment?.logo_url || "",
          likes: 0,
          user_id: "",
          user_name: "",
          user_avatar: "",
          rating: p.establishment?.rating || 0,
          total_reviews: p.establishment?.total_reviews || 0,
          distance_km: p.establishment?.distance_km || 0,
          is_popular: p.is_popular || p.establishment?.is_popular || false,
          reactions: (p.reactions || []).map((r: any) => ({ emoji: r.emoji, count: r.count || 0 })),
          recent_users: [],
          created_at: p.created_at || new Date().toISOString(),
          establishment: p.establishment,
        }));
        setPosts(mapped);
      }
      // If no data, posts stays empty — show empty state, never use MOCK_POSTS
      setLoading(false);
    });
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.establishment_category === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-background pt-14">
      <GlobalHeader />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[104px]">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-full aspect-[4/5]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          ) : (
            <>
              {filteredPosts.map((post, index) => (
                <PostCard key={post.id} post={post} isFirst={index === 0} />
              ))}
              {filteredPosts.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Nenhum post encontrado</p>
                  <p className="text-xs text-muted-foreground mt-1">Tente outra categoria</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showCheckin && (
        <ProximityCheckinCard
          name="Bella Gramado Ristorante"
          distance={150}
          onCheckin={() => setShowCheckin(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
