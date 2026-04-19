import { useState, useEffect } from "react";
import { Heart, Route as RouteIcon, FolderPlus, Folder, ChevronLeft, ChevronRight, Bookmark, Plus } from "lucide-react";
import { CloseButton } from "@/components/ui/CloseButton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_ROUTES } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";
import { toast } from "sonner";

interface FavoriteFolder {
  id: string;
  name: string;
  total: number;
}

interface SaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  establishmentId?: string;
  onSaved?: () => void;
}

type Step = "choice" | "route" | "favorite";

export function SaveSheet({ open, onOpenChange, itemName, establishmentId, onSaved }: SaveSheetProps) {
  const [step, setStep] = useState<Step>("choice");
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // reset on close
  useEffect(() => {
    if (!open) {
      setStep("choice");
      setCreatingFolder(false);
      setNewFolderName("");
    }
  }, [open]);

  // load folders when entering favorite step
  useEffect(() => {
    if (step !== "favorite") return;
    (async () => {
      try {
        const userId = await getCurrentUserId();
        const { data } = await (supabase as any).rpc("get_user_folders", { p_user_id: userId });
        setFolders(((data as any[]) ?? []).map(f => ({ id: f.id, name: f.name, total: Number(f.total ?? 0) })));
      } catch {
        setFolders([]);
      }
    })();
  }, [step]);

  async function handleSaveFavorite(folderId?: string | null, newName?: string) {
    if (!establishmentId) { onOpenChange(false); return; }
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await (supabase as any).rpc("save_favorite_to_folder", {
        p_user_id: userId,
        p_establishment_id: establishmentId,
        p_folder_id: folderId ?? null,
        p_new_folder_name: newName ?? null,
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);
      window.dispatchEvent(new CustomEvent("favorites:changed"));
      onSaved?.();
      onOpenChange(false);
      toast.success(newName
        ? `"${itemName}" salvo em "${newName}"`
        : folderId
          ? `"${itemName}" salvo na pasta`
          : `"${itemName}" salvo nos favoritos!`);
    } catch {
      toast.error("Erro ao salvar favorito");
    }
  }

  const handleAddToRoute = (routeId: string) => {
    const route = MOCK_ROUTES.find((r) => r.id === routeId);
    onOpenChange(false);
    onSaved?.();
    toast.success(`Adicionado ao roteiro "${route?.title}"`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-2 pb-3 pt-1">
          {step !== "choice" && (
            <button
              onClick={() => setStep("choice")}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <h2 className="text-base font-bold text-foreground">
            {step === "choice" && "Salvar"}
            {step === "route" && "Escolher roteiro"}
            {step === "favorite" && "Salvar favorito"}
          </h2>
        </div>

        {/* Choice */}
        {step === "choice" && (
          <div className="space-y-2 pb-4">
            <button
              onClick={() => setStep("route")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <RouteIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Adicionar ao roteiro</p>
                <p className="text-xs text-muted-foreground">Incluir num roteiro de viagem</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setStep("favorite")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Salvar como favorito</p>
                <p className="text-xs text-muted-foreground">Organize em pastas ou salve direto</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Route */}
        {step === "route" && (
          <div className="space-y-2 pb-4">
            {MOCK_ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <button
                  key={route.id}
                  onClick={() => handleAddToRoute(route.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
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
        )}

        {/* Favorite */}
        {step === "favorite" && (
          <div className="space-y-2 pb-4">
            {/* Save without folder */}
            <button
              onClick={() => handleSaveFavorite(null)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:bg-secondary transition-colors"
            >
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Salvar sem pasta</span>
            </button>

            {/* Existing folders */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleSaveFavorite(folder.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                <Folder className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground flex-1 text-left">{folder.name}</span>
                <span className="text-xs text-muted-foreground">{folder.total}</span>
              </button>
            ))}

            {/* Create new folder */}
            {!creatingFolder ? (
              <button
                onClick={() => setCreatingFolder(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Nova pasta</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="Nome da pasta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      handleSaveFavorite(null, newFolderName.trim());
                    }
                  }}
                  className="h-10 text-sm"
                />
                <Button
                  size="sm"
                  className="rounded-full h-10 px-4"
                  disabled={!newFolderName.trim()}
                  onClick={() => handleSaveFavorite(null, newFolderName.trim())}
                >
                  Salvar
                </Button>
                <CloseButton
                  variant="ghost"
                  size="sm"
                  label="Cancelar"
                  onClick={() => { setCreatingFolder(false); setNewFolderName(""); }}
                />
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
