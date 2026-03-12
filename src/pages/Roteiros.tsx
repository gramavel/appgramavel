import { useState } from "react";
import { ChevronRight, Clock, MapPin, Star, ChevronLeft } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_ROUTES, type RouteItem } from "@/data/mock";
import { cn } from "@/lib/utils";

function RouteDetailSheet({ route, onClose }: { route: RouteItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-background rounded-t-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Banner */}
        <div className="aspect-[2/1] overflow-hidden">
          <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Title + badges */}
          <div>
            <h2 className="text-xl font-bold text-foreground">{route.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="w-3 h-3" />
                {route.duration}
              </Badge>
              <Badge variant="secondary" className="text-xs">{route.difficulty}</Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                {route.stops.length} paradas
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{route.description}</p>

          {/* Stops */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Paradas do roteiro</h3>
            <div className="space-y-2">
              {route.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">{stop.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <Button className="rounded-full gap-2">
              <MapPin className="w-4 h-4" />
              Iniciar roteiro
            </Button>
            <Button variant="outline" className="rounded-full gap-2">
              <Star className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Roteiros() {
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const FILTERS = ["Todos", "Curtos", "1 dia", "2+ dias"];

  const filteredRoutes = MOCK_ROUTES.filter((route) => {
    if (!activeFilter || activeFilter === "Todos") return true;
    if (activeFilter === "Curtos") return route.duration.includes("hora");
    if (activeFilter === "1 dia") return route.duration === "1 dia" || route.duration.includes("hora");
    if (activeFilter === "2+ dias") return route.duration.includes("2 dia") || route.duration.includes("3 dia");
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Roteiros" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        {/* Filters */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                  (activeFilter === filter || (!activeFilter && filter === "Todos"))
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-primary/30 text-foreground hover:border-primary"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Route */}
        {filteredRoutes.length > 0 && (
          <div
            className="relative rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setSelectedRoute(filteredRoutes[0])}
          >
            <div className="aspect-[2/1] overflow-hidden">
              <img src={filteredRoutes[0].image} alt={filteredRoutes[0].title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg">{filteredRoutes[0].title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs gap-1">
                  <Clock className="w-3 h-3" />
                  {filteredRoutes[0].duration}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs gap-1">
                  <MapPin className="w-3 h-3" />
                  {filteredRoutes[0].stops.length} paradas
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Route list */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Todos os roteiros</h2>
          <div className="space-y-2">
            {filteredRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-foreground text-sm">{route.title}</h4>
                    <p className="text-xs text-muted-foreground">{route.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {filteredRoutes.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">Nenhum roteiro encontrado nesta categoria</p>
          </div>
        )}
      </main>

      <BottomNav />

      {selectedRoute && (
        <RouteDetailSheet route={selectedRoute} onClose={() => setSelectedRoute(null)} />
      )}
    </div>
  );
}
