import { useState } from "react";
import { Ticket } from "lucide-react";
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

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[64px]">
        <div className="space-y-4">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Nenhum cupom encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">Tente outra categoria</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
