import { useState } from "react";
import { Search, X, MapPin, Clock, Star, TrendingUp, Heart, Dog, Ticket, ChevronRight, Map as MapIcon } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { CATEGORIES, MOCK_ESTABLISHMENTS, MOCK_ROUTES, EXPERIENCES } from "@/data/mock";
import { cn } from "@/lib/utils";

const FILTER_CHIPS = [
  { label: "Perto de você", icon: MapPin },
  { label: "Abertos agora", icon: Clock },
  { label: "Mais bem avaliados", icon: Star },
  { label: "Em alta hoje", icon: TrendingUp },
  { label: "Românticos", icon: Heart },
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
            className="h-11 pl-9 pr-9 bg-card shadow-sm"
            placeholder="Buscar locais, categorias..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setShowMap(false); }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => { setSearch(""); setShowMap(true); }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2">
            {FILTER_CHIPS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setActiveFilter(activeFilter === label ? null : label);
                  if (activeFilter !== label) setShowMap(false); else setShowMap(true);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  activeFilter === label
                    ? "bg-primary text-primary-foreground shadow-md border-transparent"
                    : "bg-card border-primary/30 text-foreground hover:border-primary hover:bg-primary/5"
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
            {/* Map placeholder */}
            <div className="h-[45vh] min-h-[350px] rounded-lg border border-border shadow-sm bg-secondary flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Mapa Leaflet</p>
                <p className="text-xs">Será carregado com geolocalização</p>
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Categorias</h2>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={() => { setActiveFilter(label); setShowMap(false); }}
                    className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-border shadow-sm bg-card hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experiences Carousel */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Experiências</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3">
                  {EXPERIENCES.map((exp) => (
                    <div key={exp.id} className="basis-[70%] shrink-0 relative rounded-xl overflow-hidden aspect-[3/2]">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <h3 className="absolute bottom-3 left-3 text-white font-semibold text-sm">{exp.title}</h3>
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
                  <button
                    key={route.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {route.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold">{route.title}</p>
                      <p className="text-xs text-muted-foreground">{route.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
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
            <div className="space-y-2">
              {filteredEstablishments.map((est) => (
                <div
                  key={est.id}
                  className="flex gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img src={est.image_url} alt={est.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{est.name}</h3>
                    <p className="text-xs text-muted-foreground">{est.category}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{est.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {(Math.random() * 3 + 0.2).toFixed(1)} km
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
