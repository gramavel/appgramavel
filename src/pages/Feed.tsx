import { useState } from "react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { PostCard } from "@/components/feed/PostCard";
import { ProximityCheckinCard } from "@/components/feed/ProximityCheckinCard";
import { MOCK_POSTS } from "@/data/mock";

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCheckin, setShowCheckin] = useState(true);

  const filteredPosts = selectedCategory
    ? MOCK_POSTS.filter((p) => p.establishment_category === selectedCategory)
    : MOCK_POSTS;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[64px]">
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
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
