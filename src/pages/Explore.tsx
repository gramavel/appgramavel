import { useState, useMemo, useEffect } from "react";
import { Search, X, MapPin, Clock, Star, TrendingUp, Dog, Ticket } from "lucide-react";
import { FilterChip, FilterChipsBar } from "@/components/ui/FilterChips";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { CATEGORIES, MOCK_ESTABLISHMENTS, EXPERIENCES, type Establishment } from "@/data/mock";
import { getEstablishments } from "@/services/establishments";
import { getExperiences } from "@/services/experiences";
import { isOpenNow } from "@/lib/utils";
import ExploreMap from "@/components/map/ExploreMap";
import "@/components/map/map-styles.css";

const FILTER_CHIPS = [
  { label: "Perto de você", icon: MapPin },
  { label: "Abertos agora", icon: Clock },
  { label: "Mais bem avaliados", icon: Star },
  { label: "Em alta hoje", icon: TrendingUp },
  { label: "Pet friendly", icon: Dog },
  { label: "Com cupons", icon: Ticket },
];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(true);
  const [establishments, setEstablishments] = useState<Establishment[]>(MOCK_ESTABLISHMENTS);
  const [experiences, setExperiences] = useState(EXPERIENCES);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEstablishments().then(({ data }) => {
      if (data && data.length > 0) {
        setEstablishments(data.map((e: any) => ({
          ...e,
          city: "Gramado",
          is_active: true,
          is_verified: true,
          gallery: e.gallery || [],
          sunday_hours: e.sunday_hours || null,
        })) as Establishment[]);
      }
      setLoading(false);
    });
    getExperiences().then(({ data }) => {
      if (data && data.length > 0) {
        setExperiences(data.map((e: any) => ({
          id: e.id,
          title: e.title,
          image: e.image_url || "",
        })));
      }
    });
  }, []);

  const isSearching = search.length > 0 || activeFilters.length > 0;

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
    setShowMap(false);
  };

  const filteredEstablishments = useMemo(() => {
    let result = [...establishments];

    if (activeFilters.includes("Abertos agora"))
      result = result.filter((e) => isOpenNow(e as any));
    if (activeFilters.includes("Em alta hoje"))
      result = result.filter((e) => e.is_popular);
    if (activeFilters.includes("Pet friendly"))
      result = result.filter((e) => e.pet_friendly);

    if (search)
      result = result.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      );

    if (activeFilters.includes("Mais bem avaliados")) {
      result = result.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (activeFilters.includes("Perto de você")) {
      result = result.slice().sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    }

    return result;
  }, [activeFilters, search, establishments]);

  const popularPlaces = useMemo(() =>
    establishments.filter(e => e.is_popular).slice(0, 3),
    [establishments]
  );

  const recommendedPlaces = useMemo(() =>
    [...establishments].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3),
    [establishments]
  );

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Explorar" />

      <main className="max-w-2xl mx-auto pb-24 pt-[64px]">
        {/* Hero Section with Search and Filters */}
        <div className="px-4 pt-6 pb-8 space-y-6 bg-gradient-to-b from-background to-secondary/20">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Descubra <span className="text-primary">Gramado</span>
            </h1>
            <p className="text-sm text-muted-foreground">Encontre os melhores lugares e experiências.</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              className="h-12 pl-11 pr-11 bg-background border-border/50 shadow-sm focus:ring-primary/20 rounded-full text-sm"
              placeholder="O que você está procurando?"
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value) setShowMap(false); }}
            />
            {search && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                onClick={() => { setSearch(""); if (activeFilters.length === 0) setShowMap(true); }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <FilterChipsBar className="-mx-4 px-4">
            {FILTER_CHIPS.map(({ label, icon }) => (
              <FilterChip
                key={label}
                label={label}
                icon={icon}
                active={activeFilters.includes(label)}
                onClick={() => toggleFilter(label)}
              />
            ))}
          </FilterChipsBar>
        </div>

        {/* Map or Results */}
        <div className="px-4 space-y-10">
          {showMap && !isSearching ? (
            <>
              {/* Featured Map */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black tracking-tight">Mapa de Descobertas</h2>
                  <button onClick={() => setShowMap(false)} className="text-xs font-bold text-primary hover:underline transition-all active:scale-95">Ver lista</button>
                </div>
                <ExploreMap />
              </div>

              {/* Category Grid - Modernized */}
              <div className="space-y-4">
                <h2 className="text-lg font-black tracking-tight">Categorias</h2>
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORIES.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => navigate(`/map/categoria/${encodeURIComponent(label)}`)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 group-hover:scale-105 transition-all duration-300">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground text-center leading-tight uppercase tracking-wider">{label.split(' ')[0]}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => navigate(`/map/categoria/${encodeURIComponent("Cupons")}`)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 group-hover:scale-105 transition-all duration-300">
                      <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground text-center leading-tight uppercase tracking-wider">Cupons</span>
                  </button>
                </div>
              </div>

              {/* Popular Places - Horizontal Carousel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black tracking-tight">Populares agora</h2>
                  <button className="text-xs font-bold text-primary hover:underline transition-all active:scale-95">Ver todos</button>
                </div>
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-4 pb-4">
                    {popularPlaces.map((place) => (
                      <PlaceCard
                        key={place.id || place.name}
                        id={place.id}
                        name={place.name}
                        category={place.category}
                        image={place.image_url}
                        slug={place.slug}
                        rating={place.rating}
                        totalReviews={place.total_reviews}
                        distance={place.distance_km}
                        isPopular={true}
                        variant="horizontal"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Experiences Carousel - Immersive */}
              <div className="space-y-4">
                <h2 className="text-lg font-black tracking-tight">Experiências únicas</h2>
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-4 pb-4">
                    {experiences.map((exp) => (
                      <div 
                        key={exp.id} 
                        className="relative shrink-0 w-[280px] h-40 rounded-3xl overflow-hidden cursor-pointer group active:scale-95 transition-all"
                      >
                        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="text-white font-black text-base leading-tight drop-shadow-md">{exp.title}</h4>
                          <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Descobrir agora</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Places - Vertical Cards */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black tracking-tight">Recomendados para você</h2>
                </div>
                <div className="space-y-4">
                  {recommendedPlaces.map((place) => (
                    <PlaceCard
                      key={place.id || place.name}
                      id={place.id}
                      name={place.name}
                      category={place.category}
                      image={place.image_url}
                      slug={place.slug}
                      rating={place.rating}
                      totalReviews={place.total_reviews}
                      distance={place.distance_km}
                      variant="vertical"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight">
                  {search ? `Resultados para "${search}"` : "Explorando locais"}
                </h2>
                <span className="text-xs font-bold bg-secondary px-2.5 py-1 rounded-full">{filteredEstablishments.length} locais</span>
              </div>
              <div className="space-y-4">
                {filteredEstablishments.map((est) => (
                  <PlaceCard
                    key={est.id || est.name}
                    id={est.id}
                    name={est.name}
                    category={est.category}
                    image={est.image_url}
                    slug={est.slug}
                    rating={est.rating}
                    totalReviews={est.total_reviews}
                    distance={est.distance_km}
                    variant="compact"
                  />
                ))}
              </div>
              {filteredEstablishments.length === 0 && (
                <div className="py-20 text-center bg-card rounded-3xl border border-dashed border-border/60">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-black">Nenhum local encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-2 px-12 leading-relaxed">Não encontramos resultados para sua busca. Tente mudar os filtros ou o termo de pesquisa.</p>
                  <Button variant="default" className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20" onClick={() => { setSearch(""); setActiveFilters([]); setShowMap(true); }}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
