import { useState } from "react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { PostCard } from "@/components/feed/PostCard";
import { MOCK_POSTS } from "@/data/mock";

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? MOCK_POSTS.filter((p) => p.establishment_category === selectedCategory)
    : MOCK_POSTS;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[108px]">
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {filteredPosts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum post encontrado nesta categoria</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
