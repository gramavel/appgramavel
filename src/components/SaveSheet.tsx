import { useState } from "react";
import { Heart, Route as RouteIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MOCK_ROUTES } from "@/data/mock";
import { toast } from "sonner";

interface SaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onSaved?: () => void;
}

export function SaveSheet({ open, onOpenChange, itemName, onSaved }: SaveSheetProps) {
  const [showRouteSelect, setShowRouteSelect] = useState(false);

  const handleWishlist = () => {
    onOpenChange(false);
    onSaved?.();
    toast.success(`"${itemName}" salvo na sua wishlist!`);
  };

  const handleAddToRoute = (routeId: string) => {
    const route = MOCK_ROUTES.find((r) => r.id === routeId);
    setShowRouteSelect(false);
    onSaved?.();
    toast.success(`Adicionado ao roteiro "${route?.title}"`);
  };

  return (
    <>
      <Sheet open={open && !showRouteSelect} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Salvar em...</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            <button
              onClick={() => { onOpenChange(false); setShowRouteSelect(true); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <RouteIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Adicionar ao roteiro</p>
                <p className="text-xs text-muted-foreground">Incluir num roteiro de viagem</p>
              </div>
            </button>
            <button
              onClick={handleWishlist}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Quero visitar</p>
                <p className="text-xs text-muted-foreground">Guardar para visitar nessa viagem</p>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showRouteSelect} onOpenChange={setShowRouteSelect}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Escolher roteiro</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            {MOCK_ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <button
                  key={route.id}
                  onClick={() => handleAddToRoute(route.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{route.title}</p>
                    <p className="text-xs text-muted-foreground">{route.stops.length} paradas · {route.duration}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
