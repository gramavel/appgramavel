import { useState, useEffect } from "react";
import { Heart, Route as RouteIcon, CheckCircle, FolderPlus, Folder as FolderIcon, Plus, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MOCK_ROUTES } from "@/data/mock";
import { toast } from "sonner";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  establishmentId?: string; // Important for real persistence
  onSaved?: () => void;
}

export function SaveSheet({ open, onOpenChange, itemName, establishmentId, onSaved }: SaveSheetProps) {
  const [view, setView] = useState<"main" | "routes" | "folders" | "new_folder">("main");
  const [newFolderName, setNewFolderName] = useState("");
  const { folders, saveToFolder, isPlaceSaved, toggleSavedPlace } = useFavorites();

  // Reset view when opening
  useEffect(() => {
    if (open) setView("main");
  }, [open]);

  const handleQuickSave = async () => {
    if (establishmentId) {
      await toggleSavedPlace(establishmentId);
      onOpenChange(false);
      onSaved?.();
      toast.success(`"${itemName}" salvo nos seus favoritos!`);
    } else {
      onOpenChange(false);
      onSaved?.();
      toast.success(`"${itemName}" salvo na sua wishlist!`);
    }
  };

  const handleVisited = () => {
    onOpenChange(false);
    onSaved?.();
    toast.success(`"${itemName}" marcado como visitado!`);
  };

  const handleAddToRoute = (routeId: string) => {
    const route = MOCK_ROUTES.find((r) => r.id === routeId);
    onOpenChange(false);
    onSaved?.();
    toast.success(`Adicionado ao roteiro "${route?.title}"`);
  };

  const handleSaveToFolder = async (folderId: string | null, name?: string) => {
    if (establishmentId) {
      await saveToFolder(establishmentId, folderId, name);
      onOpenChange(false);
      onSaved?.();
      toast.success(`"${itemName}" salvo em "${name || "Favoritos"}"`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !establishmentId) return;
    await handleSaveToFolder(null, newFolderName);
    setNewFolderName("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[32px] p-0 overflow-hidden border-none bg-background max-h-[85vh]">
        <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mt-3 mb-1" />
        
        <div className="px-6 py-4">
          {view === "main" && (
            <div className="space-y-3 pb-8">
              <div className="mb-6">
                <h3 className="text-xl font-black text-foreground">Salvar lugar</h3>
                <p className="text-sm text-muted-foreground truncate">{itemName}</p>
              </div>

              <button
                onClick={() => setView("folders")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground">Favoritos</p>
                  <p className="text-xs text-muted-foreground truncate">Salvar em uma pasta ou na lista geral</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
              </button>

              <button
                onClick={() => setView("routes")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <RouteIcon className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground">Roteiro</p>
                  <p className="text-xs text-muted-foreground truncate">Incluir em um roteiro de viagem</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
              </button>

              <button
                onClick={handleVisited}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground">Já visitei</p>
                  <p className="text-xs text-muted-foreground truncate">Marcar como lugar já visitado</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
              </button>
            </div>
          )}

          {view === "folders" && (
            <div className="space-y-4 pb-8">
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setView("main")} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <h3 className="text-xl font-black text-foreground">Minhas Pastas</h3>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
                <button
                  onClick={() => handleSaveToFolder(null, "Favoritos")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-bold text-sm flex-1">Lista Geral</span>
                </button>
                
                <Separator className="my-1 opacity-50" />

                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => handleSaveToFolder(folder.id, folder.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                      <FolderIcon className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <span className="font-bold text-sm flex-1">{folder.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setView("new_folder")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-bold text-sm text-muted-foreground group-hover:text-primary">Criar nova pasta</span>
              </button>
            </div>
          )}

          {view === "new_folder" && (
            <div className="space-y-6 pb-8">
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setView("folders")} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <h3 className="text-xl font-black text-foreground">Nova Pasta</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase ml-4">Nome da Pasta</label>
                  <Input 
                    placeholder="Ex: Restaurantes Românticos" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                    autoFocus
                  />
                </div>
                <Button 
                  className="w-full h-12 rounded-2xl font-bold text-base"
                  disabled={!newFolderName.trim()}
                  onClick={handleCreateFolder}
                >
                  Criar e Salvar
                </Button>
              </div>
            </div>
          )}

          {view === "routes" && (
            <div className="space-y-4 pb-8">
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setView("main")} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <h3 className="text-xl font-black text-foreground">Escolher Roteiro</h3>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
                {MOCK_ROUTES.map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.id}
                      onClick={() => handleAddToRoute(route.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{route.title}</p>
                        <p className="text-xs text-muted-foreground">{route.stops.length} paradas · {route.duration}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
