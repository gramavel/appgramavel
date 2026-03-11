import { Star, MapPin, Bookmark } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_ESTABLISHMENTS } from "@/data/mock";

export default function SavedPlaces() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Lugares Salvos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-2">
        {MOCK_ESTABLISHMENTS.slice(0, 4).map((est) => (
          <div key={est.id} className="flex gap-3 p-3 bg-card rounded-xl border border-border/50">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{est.name}</p>
                  <p className="text-xs text-muted-foreground">{est.category}</p>
                </div>
                <Bookmark className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {est.rating}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {(Math.random() * 3 + 0.3).toFixed(1)} km
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
