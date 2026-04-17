import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Bookmark, BookmarkCheck, Search, X, TrendingUp, Folder, ChevronDown, ChevronRight, FolderPlus, MoreVertical, Pencil, Trash2, FolderInput } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_ESTABLISHMENTS, type Establishment } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLocation } from "@/contexts/LocationContext";
import { getEstablishments } from "@/services/establishments";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";
import { toast } from "sonner";

interface FolderItem { id: string; name: string; total?: number; }
interface FavoriteRow { id: string; establishment_id: string; folder_id: string | null; }

export default function SavedPlaces() {
  const [search, setSearch] = useState("");
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>(MOCK_ESTABLISHMENTS);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // dialog states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameTarget, setRenameTarget] = useState<FolderItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FolderItem | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ favoriteId: string; estName: string; currentFolderId: string | null } | null>(null);

  const navigate = useNavigate();
  const { savedPlaces, isPlaceSaved, toggleSavedPlace } = useFavorites();
  const { getDistance, loading } = useLocation();

  useEffect(() => {
    getEstablishments().then(({ data }) => {
      if (data && data.length > 0) {
        setAllEstablishments(data.map((e: any) => ({
          ...e, city: "Gramado", is_active: true, is_verified: true,
          gallery: e.gallery || [], sunday_hours: e.sunday_hours || null,
        })) as Establishment[]);
      }
    });
    loadFoldersAndFavorites();
    const handler = () => loadFoldersAndFavorites();
    window.addEventListener("favorites:changed", handler);
    return () => window.removeEventListener("favorites:changed", handler);
  }, [savedPlaces.length]);

  async function loadFoldersAndFavorites() {
    try {
      const userId = await getCurrentUserId();
      const [foldersRes, favsRes] = await Promise.all([
        (supabase as any).rpc("get_user_folders", { p_user_id: userId }),
        (supabase as any).rpc("get_user_favorites_with_folders", { p_user_id: userId }),
      ]);
      setFolders(((foldersRes.data as any[]) ?? []).map(f => ({ id: f.id, name: f.name, total: Number(f.total ?? 0) })));
      setFavorites(((favsRes.data as any[]) ?? []).map(f => ({
        id: f.favorite_id, establishment_id: f.establishment_id, folder_id: f.folder_id,
      })));
    } catch {
      setFolders([]); setFavorites([]);
    }
  }

  const places = allEstablishments.filter((e) => isPlaceSaved(e.id));
  const filtered = places.filter((est) =>
    est.name.toLowerCase().includes(search.toLowerCase()) ||
    est.category.toLowerCase().includes(search.toLowerCase())
  );

  const favByEstId: Record<string, FavoriteRow> = {};
  favorites.forEach(f => { favByEstId[f.establishment_id] = f; });

  const placesByFolder = (folderId: string) =>
    filtered.filter(p => favByEstId[p.id]?.folder_id === folderId);
  const placesWithoutFolder = filtered.filter(p => !favByEstId[p.id]?.folder_id);

  const popularPlaces = allEstablishments.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);

  // ===== folder actions (RPCs only) =====
  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      const userId = await getCurrentUserId();
      // create empty folder by calling save_favorite_to_folder requires an estId;
      // for empty folder creation use direct insert through RPC isn't available, so use favorite_folders insert as fallback.
      const { error } = await (supabase as any).from("favorite_folders").insert({ user_id: userId, name });
      if (error) throw error;
      toast.success(`Pasta "${name}" criada`);
      setNewFolderName(""); setShowCreateFolder(false);
      loadFoldersAndFavorites();
    } catch {
      toast.error("Erro ao criar pasta");
    }
  }

  async function handleRenameFolder() {
    if (!renameTarget) return;
    const name = renameValue.trim();
    if (!name) return;
    const { data, error } = await (supabase as any).rpc("rename_folder", {
      p_folder_id: renameTarget.id,
      p_new_name: name,
    });
    if (error || (data && data.success === false)) { toast.error("Erro ao renomear"); return; }
    toast.success("Pasta renomeada");
    setRenameTarget(null);
    loadFoldersAndFavorites();
  }

  async function handleDeleteFolder(keepFavorites: boolean) {
    if (!deleteTarget) return;
    const { data, error } = await (supabase as any).rpc("delete_folder", {
      p_folder_id: deleteTarget.id,
      p_mode: keepFavorites ? "folder_only" : "with_content",
    });
    if (error || (data && data.success === false)) { toast.error("Erro ao excluir pasta"); return; }
    toast.success(keepFavorites ? "Pasta excluída — conteúdo movido para sem pasta" : "Pasta e conteúdo excluídos");
    setDeleteTarget(null);
    window.dispatchEvent(new CustomEvent("favorites:changed"));
    loadFoldersAndFavorites();
  }

  async function handleMoveFavorite(targetFolderId: string | null) {
    if (!moveTarget) return;
    const fav = favorites.find(f => f.id === moveTarget.favoriteId);
    if (!fav) { setMoveTarget(null); return; }
    const { data, error } = await (supabase as any).rpc("move_favorite_to_folder", {
      p_establishment_id: fav.establishment_id,
      p_target_folder_id: targetFolderId,
    });
    if (error || (data && data.success === false)) { toast.error("Erro ao mover"); return; }
    toast.success("Favorito movido");
    setMoveTarget(null);
    loadFoldersAndFavorites();
  }

  const renderPlace = (est: Establishment, i: number) => {
    const fav = favByEstId[est.id];
    return (
      <div
        key={est.id}
        onClick={() => navigate(`/estabelecimento/${est.slug}`)}
        className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer animate-fade-in-up"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{est.name}</p>
              <p className="text-xs text-muted-foreground">{est.category}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {fav && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 rounded-full hover:bg-secondary" aria-label="Mais opções">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => setMoveTarget({ favoriteId: fav.id, estName: est.name, currentFolderId: fav.folder_id })}>
                      <FolderInput className="w-4 h-4 mr-2" /> Mover para pasta
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => toggleSavedPlace(est.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSavedPlace(est.id); }}
                className="p-1"
                aria-label="Remover dos favoritos"
              >
                <BookmarkCheck className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-rating text-rating" />{est.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {loading ? <Skeleton className="w-8 h-3" /> : (getDistance(est.latitude, est.longitude) ?? `${(est.distance_km ?? 0).toFixed(1)} km`)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const toggleFolder = (id: string) => setOpenFolders(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const hasAnyContent = places.length > 0 || folders.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Favoritos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-20 space-y-4">
        {/* Search + actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar favoritos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 bg-card border-border/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Limpar busca">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowCreateFolder(true)}
            aria-label="Criar nova pasta"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>

        {!hasAnyContent ? (
          <div className="space-y-6">
            <EmptyState
              icon={Bookmark}
              title="Nenhum favorito ainda"
              description="Salve seus lugares favoritos para planejar seu roteiro perfeito por Gramado e Canela."
              actionLabel="Explorar lugares"
              onAction={() => navigate("/map")}
            />
            <div className="space-y-3">
              <SectionTitle>
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />Populares perto de você
                </span>
              </SectionTitle>
              <div className="space-y-3">{popularPlaces.map(renderPlace)}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Folders (always show, even empty) */}
            {folders.map(folder => {
              const items = placesByFolder(folder.id);
              const isOpen = openFolders[folder.id] ?? true;
              return (
                <div key={folder.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button onClick={() => toggleFolder(folder.id)} className="flex items-center gap-1.5 flex-1 min-w-0">
                      {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <SectionTitle>
                        <span className="inline-flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-primary" />
                          {folder.name} · {items.length}
                        </span>
                      </SectionTitle>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-full hover:bg-secondary" aria-label="Opções da pasta">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setRenameTarget(folder); setRenameValue(folder.name); }}>
                          <Pencil className="w-4 h-4 mr-2" /> Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(folder)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir pasta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {isOpen && (
                    items.length > 0 ? (
                      <div className="space-y-3">{items.map(renderPlace)}</div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic px-1">Pasta vazia</p>
                    )
                  )}
                </div>
              );
            })}

            {/* Without folder */}
            {placesWithoutFolder.length > 0 && (
              <div className="space-y-3">
                {folders.length > 0 && <SectionTitle>Sem pasta · {placesWithoutFolder.length}</SectionTitle>}
                <div className="space-y-3">{placesWithoutFolder.map(renderPlace)}</div>
              </div>
            )}

            {/* Search returned nothing but content exists */}
            {filtered.length === 0 && search && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum favorito encontrado</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create folder */}
      <Sheet open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Nova pasta</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 pb-4">
            <Input
              placeholder="Nome da pasta..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />
            <Button className="w-full" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Criar pasta
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rename folder */}
      <Sheet open={!!renameTarget} onOpenChange={(v) => !v && setRenameTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Renomear pasta</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 pb-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
              autoFocus
            />
            <Button className="w-full" onClick={handleRenameFolder} disabled={!renameValue.trim()}>Salvar</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Move favorite */}
      <Sheet open={!!moveTarget} onOpenChange={(v) => !v && setMoveTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-bold text-foreground">Mover "{moveTarget?.estName}"</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-4">
            <button
              onClick={() => handleMoveFavorite(null)}
              disabled={moveTarget?.currentFolderId === null}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground text-left flex-1">Sem pasta</p>
            </button>
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => handleMoveFavorite(f.id)}
                disabled={moveTarget?.currentFolderId === f.id}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-all disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground text-left flex-1">{f.name}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete folder */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha o que fazer com os favoritos desta pasta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Button variant="outline" onClick={() => handleDeleteFolder(true)}>
              Excluir só a pasta (mover favoritos para "sem pasta")
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteFolder(false)}>
              Excluir pasta e todo conteúdo
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
