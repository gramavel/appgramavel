import { useState } from "react";
import { Star, MapPin, Bookmark, Search, X } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_ESTABLISHMENTS } from "@/data/mock";
import { Input } from "@/components/ui/input";

export default function SavedPlaces() {
  const [search, setSearch] = useState("");
  const places = MOCK_ESTABLISHMENTS.slice(0, 4);
  const filtered = places.filter((est) =>
    est.name.toLowerCase().includes(search.toLowerCase()) ||
    est.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Lugares Salvos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lugares salvos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 bg-card border-border/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum lugar encontrado</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Salve seus lugares favoritos para vê-los aqui</p>
          </div>
        ) : (
          filtered.map((est, i) => (
            <div
              key={est.id}
              className="flex gap-4 p-4 bg-card rounded-lg border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
              style={{ animationDelay: `${i * 80}ms`, animation: "fadeInUp 0.4s ease-out both" }}
            >
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
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {est.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {(Math.random() * 3 + 0.3).toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
      <BottomNav />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
