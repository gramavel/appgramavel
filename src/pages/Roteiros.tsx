import { useState } from "react";
import { ChevronRight, Clock, MapPin, Star, Plus, X, Mountain } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MOCK_ROUTES, MOCK_ESTABLISHMENTS, type RouteItem } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function RouteDetailSheet({ route, onClose }: { route: RouteItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-background rounded-t-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="aspect-[2/1] overflow-hidden">
          <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
        </div>
        <div className="px-4 py-4 space-y-4">
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
          <p className="text-sm text-muted-foreground leading-relaxed">{route.description}</p>
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
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStops, setSelectedStops] = useState<string[]>([]);

  // Mock user routes (empty by default)
  const [userRoutes] = useState<RouteItem[]>([]);

  const FILTERS = ["Todos", "Curtos", "1 dia", "2+ dias"];

  const filterRoute = (route: RouteItem) => {
    if (!activeFilter || activeFilter === "Todos") return true;
    if (activeFilter === "Curtos") return route.duration.includes("hora");
    if (activeFilter === "1 dia") return route.duration === "1 dia" || route.duration.includes("hora");
    if (activeFilter === "2+ dias") return route.duration.includes("2 dia") || route.duration.includes("3 dia");
    return true;
  };

  const filteredSuggested = MOCK_ROUTES.filter(filterRoute);
  const filteredUser = userRoutes.filter(filterRoute);

  const toggleStop = (id: string) => {
    setSelectedStops((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedStops([]);
    setCreateOpen(false);
    toast.success("Roteiro criado!");
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Roteiros" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-6">
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

        {/* SECTION 1: Roteiros Sugeridos */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Roteiros sugeridos</p>

          {/* Featured Route */}
          {filteredSuggested.length > 0 && (
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedRoute(filteredSuggested[0])}
            >
              <div className="aspect-[2/1] overflow-hidden">
                <img src={filteredSuggested[0].image} alt={filteredSuggested[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary/80 text-primary-foreground border-0 text-[10px] backdrop-blur-sm">
                    Curado pelo Gramável
                  </Badge>
                </div>
                <h3 className="text-white font-bold text-lg">{filteredSuggested[0].title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    {filteredSuggested[0].duration}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs gap-1">
                    <MapPin className="w-3 h-3" />
                    {filteredSuggested[0].stops.length} paradas
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Suggested route list */}
          <div className="space-y-2">
            {filteredSuggested.map((route) => {
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
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground text-sm">{route.title}</h4>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">Curado</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{route.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          {filteredSuggested.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Nenhum roteiro sugerido nesta categoria</p>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-border" />

        {/* SECTION 2: Meus Roteiros */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Meus roteiros</p>

          {filteredUser.length > 0 ? (
            <div className="space-y-2">
              {filteredUser.map((route) => {
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
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Crie seu primeiro roteiro</p>
              <p className="text-xs text-muted-foreground mb-4">Personalize sua viagem com seus lugares favoritos</p>
              <Button className="rounded-full gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                Criar roteiro
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:shadow-xl"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Route Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Criar Roteiro</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do roteiro</label>
              <Input placeholder="Ex: Meu dia em Gramado" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
              <Textarea placeholder="Descreva seu roteiro..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Paradas ({selectedStops.length} selecionadas)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {MOCK_ESTABLISHMENTS.map((est) => {
                  const selected = selectedStops.includes(est.id);
                  return (
                    <button
                      key={est.id}
                      onClick={() => toggleStop(est.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all active:scale-[0.98] ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={est.logo_url} alt={est.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{est.name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {est.category}
                        </p>
                      </div>
                      {selected && <X className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button className="w-full rounded-full gap-2" disabled={!title.trim() || selectedStops.length === 0} onClick={resetForm}>
              <Plus className="w-4 h-4" />
              Criar Roteiro
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />

      {selectedRoute && (
        <RouteDetailSheet route={selectedRoute} onClose={() => setSelectedRoute(null)} />
      )}
    </div>
  );
}
