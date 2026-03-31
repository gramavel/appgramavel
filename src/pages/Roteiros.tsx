import { useState } from "react";
import { ChevronRight, Clock, MapPin, Star, Plus, X, Search, MoreVertical, Trash2, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterChip, FilterChipsBar } from "@/components/ui/FilterChips";
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

export default function Roteiros() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Mock user routes
  const [userRoutes, setUserRoutes] = useState<RouteItem[]>([]);

  const FILTERS = ["Todos", "Curtos", "1 dia", "2+ dias"];
  const CATEGORIES = [...new Set(MOCK_ESTABLISHMENTS.map(e => e.category))];

  const filterRoute = (route: RouteItem) => {
    if (!activeFilter || activeFilter === "Todos") return true;
    if (activeFilter === "Curtos") return route.duration.includes("hora");
    if (activeFilter === "1 dia") return route.duration === "1 dia" || route.duration.includes("hora");
    if (activeFilter === "2+ dias") return route.duration.includes("2 dia") || route.duration.includes("3 dia");
    return true;
  };

  const filteredSuggested = MOCK_ROUTES.filter(filterRoute);
  const filteredUser = userRoutes.filter(filterRoute);

  const filteredEstablishments = MOCK_ESTABLISHMENTS.filter(est => {
    const matchSearch = !searchQuery || est.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !categoryFilter || est.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggleStop = (id: string) => {
    setSelectedStops((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    const stops = selectedStops.map(id => {
      const est = MOCK_ESTABLISHMENTS.find(e => e.id === id);
      return { name: est?.name || "", image: est?.logo_url || "", category: est?.category || "" };
    });
    const newRoute: RouteItem = {
      id: `user-${Date.now()}`,
      title,
      description,
      subtitle: `${stops.length} locais · Personalizado`,
      duration: "Personalizado",
      difficulty: "Personalizado",
      stops,
      icon: MapPin,
      image: stops[0]?.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    };
    setUserRoutes(prev => [...prev, newRoute]);
    setTitle("");
    setDescription("");
    setSelectedStops([]);
    setSearchQuery("");
    setCategoryFilter(null);
    setCreateStep(1);
    setCreateOpen(false);
    toast.success("Roteiro criado com sucesso!");
  };

  const openCreate = () => {
    setCreateStep(1);
    setTitle("");
    setDescription("");
    setSelectedStops([]);
    setSearchQuery("");
    setCategoryFilter(null);
    setCreateOpen(true);
  };

  const deleteUserRoute = (id: string) => {
    setUserRoutes(prev => prev.filter(r => r.id !== id));
    setMenuOpenId(null);
    toast.success("Roteiro excluído");
  };

  const selectedStopDetails = selectedStops.map(id => MOCK_ESTABLISHMENTS.find(e => e.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-background pt-14">
      <GlobalHeader title="Roteiros" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[72px] space-y-6">
        {/* Filters */}
        <FilterChipsBar>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilter === filter || (!activeFilter && filter === "Todos")}
              onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
            />
          ))}
        </FilterChipsBar>

        {/* SECTION 1: Roteiros Sugeridos */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Roteiros sugeridos</p>

          {/* Featured Route */}
          {filteredSuggested.length > 0 && (
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/roteiros/${filteredSuggested[0].id}`)}
            >
              <div className="aspect-[2/1] overflow-hidden">
                <img src={filteredSuggested[0].image} alt={filteredSuggested[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
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
              <div className="absolute top-3 right-3">
                <ChevronRight className="w-5 h-5 text-white/70" />
              </div>
            </div>
          )}

          {/* Suggested route list */}
          <div className="space-y-2">
            {filteredSuggested.slice(1).map((route) => {
              const Icon = route.icon;
              return (
                <button
                  key={route.id}
                  onClick={() => navigate(`/roteiros/${route.id}`)}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
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

          {filteredSuggested.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Nenhum roteiro sugerido</p>
              <p className="text-xs text-muted-foreground mt-1">Tente outro filtro</p>
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
                  <div key={route.id} className="relative">
                    <button
                      onClick={() => navigate(`/roteiros/${route.id}`)}
                      className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-foreground text-sm">{route.title}</h4>
                        <p className="text-xs text-muted-foreground">{route.subtitle}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === route.id ? null : route.id); }}
                        className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </button>

                    {/* Context menu */}
                    {menuOpenId === route.id && (
                      <div className="absolute right-2 top-12 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <button
                          onClick={() => { navigate(`/roteiros/${route.id}`); setMenuOpenId(null); }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary w-full"
                        >
                          <Edit3 className="w-4 h-4" /> Editar
                        </button>
                        <button
                          onClick={() => deleteUserRoute(route.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 w-full"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
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
              <Button className="rounded-full gap-2" onClick={openCreate}>
                <Plus className="w-4 h-4" />
                Criar roteiro
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* FAB - only show when user has routes */}
      {userRoutes.length > 0 && (
        <button
          onClick={openCreate}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:shadow-xl"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Create Route Sheet — 3 Step Wizard */}
      <Sheet open={createOpen} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setCreateStep(1); } }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg font-bold text-foreground">Criar Roteiro</SheetTitle>
          </SheetHeader>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 py-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  createStep >= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={cn(
                    "w-8 h-0.5 rounded-full transition-all",
                    createStep > step ? "bg-primary" : "bg-secondary"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Identity */}
          {createStep === 1 && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">Dê um nome e descrição ao seu roteiro</p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do roteiro</label>
                <Input placeholder="Ex: Meu dia em Gramado" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
                <Textarea placeholder="Descreva seu roteiro..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button
                className="w-full rounded-full"
                disabled={!title.trim()}
                onClick={() => setCreateStep(2)}
              >
                Próximo
              </Button>
            </div>
          )}

          {/* Step 2: Select stops */}
          {createStep === 2 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">Selecione os locais para seu roteiro ({selectedStops.length} selecionados)</p>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estabelecimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                      categoryFilter === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredEstablishments.map((est) => {
                  const selected = selectedStops.includes(est.id);
                  const index = selectedStops.indexOf(est.id);
                  return (
                    <button
                      key={est.id}
                      onClick={() => toggleStop(est.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all active:scale-[0.98]",
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                      )}
                    >
                      {selected && (
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </div>
                      )}
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

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setCreateStep(1)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  disabled={selectedStops.length === 0}
                  onClick={() => setCreateStep(3)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {createStep === 3 && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">Revise seu roteiro antes de criar</p>

              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h4 className="font-semibold text-foreground">{title}</h4>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedStops.length} paradas
                  </Badge>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-primary/20" />
                <div className="space-y-1">
                  {selectedStopDetails.map((est, i) => (
                    <div key={est!.id} className="relative flex items-center gap-3 p-2.5 bg-card rounded-lg border border-border/50">
                      <div className="absolute -left-8 w-[30px] h-[30px] rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold z-10">
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={est!.logo_url} alt={est!.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{est!.name}</p>
                        <p className="text-xs text-muted-foreground">{est!.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setCreateStep(2)}>
                  Voltar
                </Button>
                <Button className="flex-1 rounded-full gap-2" onClick={resetForm}>
                  <Plus className="w-4 h-4" />
                  Criar Roteiro
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}
