import { useState } from "react";
import { Search, X, MapPin, Clock, Star, TrendingUp, Heart, Dog, Ticket, ChevronRight, Map as MapIcon } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, MOCK_ESTABLISHMENTS, MOCK_ROUTES, EXPERIENCES } from "@/data/mock";
import { cn } from "@/lib/utils";
import ExploreMap from "@/components/map/ExploreMap";
import "@/components/map/map-styles.css";

const FILTER_CHIPS = [
  { label: "Perto de você", icon: MapPin },
  { label: "Abertos agora", icon: Clock },
  { label: "Mais bem avaliados", icon: Star },
  { label: "Em alta hoje", icon: TrendingUp },
  { label: "Pet friendly", icon: Dog },
  { label: "Com cupons", icon: Ticket },
];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  const isSearching = search.length > 0 || activeFilter !== null;

  const filteredEstablishments = MOCK_ESTABLISHMENTS.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Explorar" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="h-11 pl-9 pr-9 bg-card border-border shadow-sm"
            placeholder="Buscar locais, categorias..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setShowMap(false); }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setSearch(""); setShowMap(true); }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            {FILTER_CHIPS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setActiveFilter(activeFilter === label ? null : label);
                  if (activeFilter !== label) setShowMap(false); else setShowMap(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                  activeFilter === label
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-primary/30 text-foreground hover:border-primary"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Map or Results */}
        {showMap && !isSearching ? (
          <>
            <ExploreMap />

            {/* Category Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Categorias</h2>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={() => { setActiveFilter(label); setShowMap(false); }}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experiences Carousel */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Experiências</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3 pb-2">
                  {EXPERIENCES.map((exp) => (
                    <div key={exp.id} className="relative shrink-0 w-[70%] h-36 rounded-xl overflow-hidden">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm">{exp.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Routes */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Roteiros Prontos</h2>
              <div className="space-y-2">
                {MOCK_ROUTES.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                      {route.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-foreground text-sm">{route.title}</h4>
                      <p className="text-xs text-muted-foreground">{route.subtitle}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results list */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredEstablishments.length} resultado(s)
              </p>
              <button
                onClick={() => { setShowMap(true); setActiveFilter(null); setSearch(""); }}
                className="flex items-center gap-1.5 text-xs text-primary font-medium"
              >
                <MapIcon className="w-4 h-4" />
                Ver mapa
              </button>
            </div>
            <div className="space-y-3">
              {filteredEstablishments.map((est) => (
                <Card key={est.id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-semibold text-sm leading-tight truncate">{est.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{est.category}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{est.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{(Math.random() * 3 + 0.2).toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
