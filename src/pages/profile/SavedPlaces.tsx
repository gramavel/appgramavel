import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Bookmark, BookmarkCheck, Search, X, TrendingUp } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_ESTABLISHMENTS, type Establishment } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLocation } from "@/contexts/LocationContext";
import { getEstablishments } from "@/services/establishments";

export default function SavedPlaces() {
  const [search, setSearch] = useState("");
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>(MOCK_ESTABLISHMENTS);
  const navigate = useNavigate();
  const { savedPlaces, isPlaceSaved, toggleSavedPlace } = useFavorites();
  const { getDistance, loading } = useLocation();

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

  const places = allEstablishments.filter((e) => isPlaceSaved(e.id));
  const filtered = places.filter((est) =>
    est.name.toLowerCase().includes(search.toLowerCase()) ||
    est.category.toLowerCase().includes(search.toLowerCase())
  );

  const popularPlaces = allEstablishments
    .slice()
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Lugares Salvos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-20 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lugares salvos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 bg-card border-border/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 && places.length === 0 ? (
          <div className="space-y-6">
            <EmptyState
              icon={Bookmark}
              title="Nenhum lugar salvo ainda"
              description="Salve seus lugares favoritos para planejar seu roteiro perfeito por Gramado e Canela."
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
                    className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{est.name}</p>
                      <p className="text-xs text-muted-foreground">{est.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-rating text-rating" />
                          {est.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {loading ? (
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
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">Nenhum lugar encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">Tente outra busca</p>
          </div>
        ) : (
          filtered.map((est, i) => (
            <div
              key={est.id}
              onClick={() => navigate(`/estabelecimento/${est.slug}`)}
              className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{est.name}</p>
                    <p className="text-xs text-muted-foreground">{est.category}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSavedPlace(est.id); }}
                    className="p-1"
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
                    {loading ? (
                      <Skeleton className="w-8 h-3" />
                    ) : (
                      getDistance(est.latitude, est.longitude) ?? `${(est.distance_km ?? 0).toFixed(1)} km`
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
      <BottomNav />
    </div>
  );
}
