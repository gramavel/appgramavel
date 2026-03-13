import { useState } from "react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { CouponCard } from "@/components/coupons/CouponCard";
import { MOCK_COUPONS } from "@/data/mock";

export default function Coupons() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? MOCK_COUPONS.filter((c) => c.category === selectedCategory)
    : MOCK_COUPONS;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Cupons" />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[100px]">
        <div className="space-y-4">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum cupom nesta categoria</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
