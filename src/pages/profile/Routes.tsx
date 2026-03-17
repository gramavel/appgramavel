import { useState } from "react";
import { ChevronRight, Clock, Mountain, Plus, X, MapPin } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MOCK_ROUTES, MOCK_ESTABLISHMENTS } from "@/data/mock";

export default function RoutesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStops, setSelectedStops] = useState<string[]>([]);

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
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Roteiros Salvos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        {MOCK_ROUTES.map((route, i) => {
          const Icon = route.icon;
          return (
            <div
              key={route.id}
              className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
              style={{ animationDelay: `${i * 100}ms`, animation: "fadeInUp 0.4s ease-out both" }}
            >
              {/* Cover image */}
              <div className="aspect-[2.5/1] overflow-hidden relative">
                <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-base">{route.title}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{route.description.slice(0, 80)}...</p>
                </div>
              </div>

              {/* Info row */}
              <div className="px-3 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[11px] gap-1 px-2 py-0.5">
                      <Clock className="w-3 h-3" />
                      {route.duration}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] gap-1 px-2 py-0.5">
                      <Mountain className="w-3 h-3" />
                      {route.difficulty}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Stop thumbnails */}
              <div className="px-3 pb-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {route.stops.slice(0, 5).map((stop, j) => (
                    <div key={j} className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-border">
                        <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center w-14 truncate">{stop.name}</span>
                    </div>
                  ))}
                  {route.stops.length > 5 && (
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border-2 border-border">
                        <span className="text-xs font-semibold text-muted-foreground">+{route.stops.length - 5}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">mais</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
              <Input
                placeholder="Ex: Meu dia em Gramado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
              <Textarea
                placeholder="Descreva seu roteiro..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/50"
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
                      {selected && (
                        <X className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full rounded-full gap-2"
              disabled={!title.trim() || selectedStops.length === 0}
              onClick={resetForm}
            >
              <Plus className="w-4 h-4" />
              Criar Roteiro
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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
