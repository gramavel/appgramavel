import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Bookmark, BookmarkCheck, Search, X, TrendingUp, FolderPlus, Folder as FolderIcon, Trash2, MoreVertical } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_ESTABLISHMENTS, type Establishment } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLocation } from "@/contexts/LocationContext";
import { getEstablishments } from "@/services/establishments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function SavedPlaces() {
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>(MOCK_ESTABLISHMENTS);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  
  const navigate = useNavigate();
  const { favorites, folders, isPlaceSaved, toggleSavedPlace, createFolder, deleteFolder, loaded: favoritesLoaded } = useFavorites();
  const { getDistance, loading: locationLoading } = useLocation();

  useEffect(() => {
    getEstablishments().then(({ data }) => {
      if (data && data.length > 0) {
        setAllEstablishments(data.map((e: any) => ({
          ...e,
          city: "Gramado",
          is_active: true,
          is_verified: true,
          gallery: e.gallery || [],
          sunday_hours: e.sunday_hours || null,
        })) as Establishment[]);
      }
    });
  }, []);

  // Filter establishments based on favorites and selected folder
  const savedEstablishments = useMemo(() => {
    return allEstablishments.filter(e => {
      const favorite = favorites.find(f => f.establishment_id === e.id);
      if (!favorite) return false;
      if (selectedFolderId === null) return true; // Show all in "Todos"
      return favorite.folder_id === selectedFolderId;
    });
  }, [allEstablishments, favorites, selectedFolderId]);

  const filtered = savedEstablishments.filter((est) =>
    est.name.toLowerCase().includes(search.toLowerCase()) ||
    est.category.toLowerCase().includes(search.toLowerCase())
  );

  const popularPlaces = allEstablishments
    .slice()
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName);
    setNewFolderName("");
    setIsCreatingFolder(false);
    toast.success("Pasta criada com sucesso!");
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir a pasta "${name}"? Os itens dentro dela não serão excluídos, apenas voltarão para a lista geral.`)) {
      await deleteFolder(id);
      if (selectedFolderId === id) setSelectedFolderId(null);
      toast.success("Pasta excluída!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Favoritos" />
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-20 space-y-6">
        
        {/* Folders Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Minhas Pastas</h2>
            <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
              <DialogTrigger asChild>
                <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
                  <FolderPlus className="w-3.5 h-3.5" />
                  Nova Pasta
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Criar nova pasta</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="Nome da pasta (ex: Restaurantes, Café...)" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="rounded-full"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCreatingFolder(false)}>Cancelar</Button>
                  <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Criar Pasta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                selectedFolderId === null 
                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Todos ({favorites.length})
            </button>
            {folders.map(folder => {
              const count = favorites.filter(f => f.folder_id === folder.id).length;
              return (
                <div key={folder.id} className="relative group flex-shrink-0">
                  <button
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 ${
                      selectedFolderId === folder.id 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <FolderIcon className={`w-3 h-3 ${selectedFolderId === folder.id ? "fill-current" : ""}`} />
                    {folder.name} ({count})
                  </button>
                  {selectedFolderId === folder.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id, folder.name); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md scale-0 group-hover:scale-100 transition-transform"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nos favoritos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-11 bg-card border-border/50 rounded-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        {!favoritesLoaded ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 && favorites.length === 0 && folders.length === 0 ? (
          <div className="space-y-6">
            <EmptyState
              icon={Bookmark}
              title="Nenhum favorito ainda"
              description="Sua lista está vazia. Comece a explorar Gramado e Canela e salve os lugares que você mais gostar!"
              actionLabel="Explorar lugares"
              onAction={() => navigate("/explorar")}
            />

            {/* Popular suggestions */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Populares perto de você
              </h3>
              <div className="space-y-3">
                {popularPlaces.map((est, i) => (
                  <div
                    key={est.id}
                    onClick={() => navigate(`/estabelecimento/${est.slug}`)}
                    className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">{est.name}</p>
                      <p className="text-xs text-muted-foreground">{est.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-rating text-rating" />
                          {est.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {locationLoading ? (
                            <Skeleton className="w-8 h-3" />
                          ) : (
                            getDistance(est.latitude, est.longitude) ?? `${(est.distance_km ?? 0).toFixed(1)} km`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto shadow-inner">
              {selectedFolderId ? <FolderIcon className="w-8 h-8 text-muted-foreground/50" /> : <Search className="w-8 h-8 text-muted-foreground/50" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {selectedFolderId ? "Esta pasta está vazia" : "Nenhum resultado encontrado"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFolderId ? "Adicione lugares aqui para organizar sua viagem." : "Tente buscar por outro nome ou categoria."}
              </p>
            </div>
            {selectedFolderId && (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSelectedFolderId(null)}>
                Ver todos os favoritos
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((est, i) => (
              <div
                key={est.id}
                onClick={() => navigate(`/estabelecimento/${est.slug}`)}
                className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-foreground text-sm truncate">{est.name}</p>
                      <p className="text-xs text-muted-foreground">{est.category}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSavedPlace(est.id); }}
                      className="p-1 hover:bg-secondary rounded-full transition-colors"
                    >
                      <BookmarkCheck className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-rating text-rating" />
                      {est.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {locationLoading ? (
                        <Skeleton className="w-8 h-3" />
                      ) : (
                        getDistance(est.latitude, est.longitude) ?? `${(est.distance_km ?? 0).toFixed(1)} km`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
