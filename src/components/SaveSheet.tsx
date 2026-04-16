import { useState, useEffect } from "react";
import { Heart, Route as RouteIcon, FolderPlus, Folder } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_ROUTES } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";
import { toast } from "sonner";

interface FavoriteFolder {
  id: string;
  name: string;
}

interface SaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  establishmentId?: string;
  onSaved?: () => void;
}

export function SaveSheet({ open, onOpenChange, itemName, establishmentId, onSaved }: SaveSheetProps) {
  const [showRouteSelect, setShowRouteSelect] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    if (showFolderSelect) {
      loadFolders();
    }
  }, [showFolderSelect]);

  async function loadFolders() {
    try {
      const userId = await getCurrentUserId();
      const { data } = await (supabase as any)
        .from("favorite_folders")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setFolders((data as FavoriteFolder[]) ?? []);
    } catch {
      setFolders([]);
    }
  }

  async function persistFavorite(folderId: string | null, folderName?: string) {
    if (!establishmentId) return { ok: true };
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await (supabase as any).rpc("save_favorite_to_folder", {
        p_user_id: userId,
        p_establishment_id: establishmentId,
        p_folder_id: folderId,
        p_new_folder_name: folderName ?? null,
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);
      // Notify FavoritesContext to reload
      window.dispatchEvent(new CustomEvent("favorites:changed"));
      return { ok: true };
    } catch (e: any) {
      console.error("save_favorite_to_folder error", e);
      return { ok: false, error: e?.message ?? "Erro desconhecido" };
    }
  }

  const handleSaveWithoutFolder = async () => {
    const res = await persistFavorite(null);
    setShowFolderSelect(false);
    onOpenChange(false);
    if (res.ok) {
      onSaved?.();
      toast.success(`"${itemName}" salvo nos favoritos!`);
    } else {
      toast.error("Erro ao salvar favorito");
    }
  };

  const handleSaveToFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    const res = await persistFavorite(folderId);
    setShowFolderSelect(false);
    onOpenChange(false);
    if (res.ok) {
      onSaved?.();
      toast.success(`"${itemName}" salvo em "${folder?.name}"`);
    } else {
      toast.error("Erro ao salvar favorito");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim();
    const res = await persistFavorite(null, name);
    if (!res.ok) {
      toast.error("Erro ao criar pasta");
      return;
    }
    setNewFolderName("");
    setShowNewFolder(false);
    setShowFolderSelect(false);
    onOpenChange(false);
    onSaved?.();
    toast.success(`"${itemName}" salvo em "${name}"`);
  };

  const handleAddToRoute = (routeId: string) => {
    const route = MOCK_ROUTES.find((r) => r.id === routeId);
    setShowRouteSelect(false);
    onSaved?.();
    toast.success(`Adicionado ao roteiro "${route?.title}"`);
  };

  return (
    <>
      {/* Main options */}
      <Sheet open={open && !showRouteSelect && !showFolderSelect} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <div className="space-y-2 pb-4 pt-2">
            <button
              onClick={() => { onOpenChange(false); setShowRouteSelect(true); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
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
              onClick={() => { onOpenChange(false); setShowFolderSelect(true); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Salvar como favorito</p>
                <p className="text-xs text-muted-foreground">Guardar nos seus lugares favoritos</p>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Route selection */}
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
        </SheetContent>
      </Sheet>

      {/* Folder selection */}
      <Sheet open={showFolderSelect} onOpenChange={(v) => { setShowFolderSelect(v); if (!v) setShowNewFolder(false); }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Salvar favorito</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            {/* Save without folder */}
            <button
              onClick={handleSaveWithoutFolder}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">Salvar sem pasta</p>
                <p className="text-xs text-muted-foreground">Adicionar direto aos favoritos</p>
              </div>
            </button>

            {/* Existing folders */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleSaveToFolder(folder.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground">{folder.name}</p>
                </div>
              </button>
            ))}

            {/* Create new folder */}
            {showNewFolder ? (
              <div className="flex items-center gap-2 p-4 rounded-xl border border-border bg-card">
                <Input
                  placeholder="Nome da pasta..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 h-9"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
                <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Criar
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolder(true)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-card/50 hover:bg-card transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground">Criar nova pasta</p>
                  <p className="text-xs text-muted-foreground">Organize seus favoritos</p>
                </div>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
