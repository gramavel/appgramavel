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
          <div key={est.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <img src={est.image_url} alt={est.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{est.name}</h3>
              <p className="text-xs text-muted-foreground">{est.category}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs">{est.rating}</span></div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />1.2 km</div>
              </div>
            </div>
            <Bookmark className="w-5 h-5 fill-primary text-primary shrink-0" />
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
