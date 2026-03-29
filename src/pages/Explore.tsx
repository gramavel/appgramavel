import { useState, useEffect } from "react";
import { Search, X, MapPin, Clock, Star, TrendingUp, Dog, Ticket, Map as MapIcon, Heart } from "lucide-react";
import { FilterChip, FilterChipsBar } from "@/components/ui/FilterChips";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, MOCK_ESTABLISHMENTS, MOCK_COUPONS, EXPERIENCES } from "@/data/mock";
import { CouponCard } from "@/components/coupons/CouponCard";
import { cn } from "@/lib/utils";
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

const POPULAR_PLACES = [
  { name: "Lago Negro", category: "Natureza", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", rating: 4.8 },
  { name: "Rua Coberta", category: "Atrações", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop", rating: 4.7 },
  { name: "Snowland", category: "Atrações", image: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=300&fit=crop", rating: 4.6 },
];

const RECOMMENDED_PLACES = [
  { name: "Vinícola Ravanello", category: "Bares & Vinícolas", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop", rating: 4.9 },
  { name: "Chocolate Lugano", category: "Compras", image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop", rating: 4.7 },
  { name: "Casa da Montanha", category: "Hotéis", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop", rating: 4.8 },
];

const CATEGORY_BANNERS: Record<string, string> = {
  "Restaurantes": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
  "Cafés": "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=400&fit=crop",
  "Hotéis": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=400&fit=crop",
  "Atrações": "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&h=400&fit=crop",
  "Compras": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=400&fit=crop",
  "Bares & Vinícolas": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=400&fit=crop",
  "Cupons": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
};

const CATEGORY_FILTER_CHIPS: Record<string, { label: string; icon: typeof MapPin }[]> = {
  "Restaurantes": [
    { label: "Perto de você", icon: MapPin },
    { label: "Abertos agora", icon: Clock },
    { label: "Mais bem avaliados", icon: Star },
    { label: "Pet friendly", icon: Dog },
  ],
  "Cafés": [
    { label: "Perto de você", icon: MapPin },
    { label: "Abertos agora", icon: Clock },
    { label: "Mais bem avaliados", icon: Star },
  ],
  "Hotéis": [
    { label: "Perto de você", icon: MapPin },
    { label: "Mais bem avaliados", icon: Star },
  ],
  "Atrações": [
    { label: "Perto de você", icon: MapPin },
    { label: "Mais bem avaliados", icon: Star },
    { label: "Em alta hoje", icon: TrendingUp },
  ],
  "Compras": [
    { label: "Perto de você", icon: MapPin },
    { label: "Abertos agora", icon: Clock },
    { label: "Mais bem avaliados", icon: Star },
  ],
  "Bares & Vinícolas": [
    { label: "Perto de você", icon: MapPin },
    { label: "Abertos agora", icon: Clock },
    { label: "Mais bem avaliados", icon: Star },
  ],
  "Cupons": [
    { label: "Restaurantes", icon: MapPin },
    { label: "Cafés", icon: Clock },
    { label: "Atrações", icon: Star },
    { label: "Bares & Vinícolas", icon: TrendingUp },
  ],
};

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const isSearching = search.length > 0 || activeFilter !== null;

  const filteredEstablishments = MOCK_ESTABLISHMENTS.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter) {
      const catMatch = CATEGORIES.find(c => c.label === activeFilter);
      if (catMatch && e.category !== activeFilter) return false;
    }
    return true;
  });

  const categoryEstablishments = selectedCategory && selectedCategory !== "Cupons"
    ? MOCK_ESTABLISHMENTS.filter((e) => e.category === selectedCategory).slice(0, 10)
    : [];

  const categoryCoupons = selectedCategory === "Cupons"
    ? (categoryFilter ? MOCK_COUPONS.filter(c => c.category === categoryFilter) : MOCK_COUPONS)
    : [];

  // Category detail view
  if (selectedCategory) {
    const isCoupons = selectedCategory === "Cupons";
    const catIcon = CATEGORIES.find(c => c.label === selectedCategory);
    const CatIcon = isCoupons ? Ticket : catIcon?.icon;
    const filters = CATEGORY_FILTER_CHIPS[selectedCategory] || CATEGORY_FILTER_CHIPS["Restaurantes"];

    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader showBack title={selectedCategory} onBack={() => { setSelectedCategory(null); setCategoryFilter(null); }} />
        <main className="max-w-2xl mx-auto pb-20 pt-14 space-y-4">
          {/* Banner */}
          <div className="relative aspect-[2/1] overflow-hidden">
            <img src={CATEGORY_BANNERS[selectedCategory] || CATEGORY_BANNERS["Restaurantes"]} alt={selectedCategory} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {CatIcon && <CatIcon className="w-5 h-5 text-primary-foreground" />}
              <h2 className="text-xl font-bold text-primary-foreground">{selectedCategory}</h2>
            </div>
          </div>

          {/* Filter Chips */}
          <FilterChipsBar className="px-4 mx-0">
            {filters.map(({ label, icon }) => (
              <FilterChip
                key={label}
                label={label}
                icon={icon}
                active={categoryFilter === label}
                onClick={() => setCategoryFilter(categoryFilter === label ? null : label)}
              />
            ))}
          </FilterChipsBar>

          {/* Results */}
          <div className="px-4 space-y-4">
            {isCoupons ? (
              <>
                <p className="text-sm text-muted-foreground">{categoryCoupons.length} cupom(ns) disponível(is)</p>
                {categoryCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
                {categoryCoupons.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                      <Ticket className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Nenhum cupom encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1">Tente outra categoria</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{categoryEstablishments.length} resultado(s)</p>
                {categoryEstablishments.map((est) => (
                  <Card key={est.id} className="cursor-pointer shadow-card hover:shadow-card-hover transition-shadow overflow-hidden" onClick={() => navigate(`/estabelecimento/${est.slug}`)}>
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm leading-tight truncate">{est.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{est.category}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{est.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{(Math.random() * 3 + 0.2).toFixed(1)} km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {categoryEstablishments.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                      <Search className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Nenhum estabelecimento</p>
                    <p className="text-xs text-muted-foreground mt-1">Tente outra categoria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14">
      <GlobalHeader title="Explorar" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-[60px] space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="h-10 pl-9 pr-9 bg-card border-border shadow-card"
            placeholder="Buscar locais, categorias..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setShowMap(false); }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setSearch(""); setShowMap(true); }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <FilterChipsBar>
          {FILTER_CHIPS.map(({ label, icon }) => (
            <FilterChip
              key={label}
              label={label}
              icon={icon}
              active={activeFilter === label}
              onClick={() => {
                setActiveFilter(activeFilter === label ? null : label);
                if (activeFilter !== label) setShowMap(false); else setShowMap(true);
              }}
            />
          ))}
        </FilterChipsBar>

        {/* Map or Results */}
        {showMap && !isSearching ? (
          <>
            <ExploreMap />

            {/* Category Grid */}
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-4">Categorias</h2>
              <div className="grid grid-cols-3 gap-4">
                {CATEGORIES.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedCategory(label)}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium text-foreground text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
              {/* Cupons - centered below grid */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setSelectedCategory("Cupons")}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 w-[calc(33.333%-0.667rem)]"
                >
                  <Ticket className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground text-center leading-tight">Cupons</span>
                </button>
              </div>
            </div>

            {/* Popular Places */}
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-4">Populares agora</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-2">
                  {POPULAR_PLACES.map((place) => (
                    <div key={place.name} className="shrink-0 w-[60%] rounded-xl overflow-hidden border border-border bg-card shadow-card">
                      <div className="aspect-[3/2] overflow-hidden">
                        <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-sm">{place.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{place.category}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{place.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Places */}
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-4">Recomendados</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-2">
                  {RECOMMENDED_PLACES.map((place) => (
                    <div key={place.name} className="shrink-0 w-[60%] rounded-xl overflow-hidden border border-border bg-card shadow-card">
                      <div className="aspect-[3/2] overflow-hidden">
                        <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-sm">{place.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{place.category}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{place.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Experiences Carousel */}
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-4">Experiências</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-2">
                  {EXPERIENCES.map((exp) => (
                    <div key={exp.id} className="relative shrink-0 w-[70%] h-36 rounded-xl overflow-hidden">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute bottom-4 left-4 right-4 text-primary-foreground font-semibold text-sm">{exp.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nearby establishments */}
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-4">Próximos de você</h2>
              <div className="space-y-4">
                {MOCK_ESTABLISHMENTS.slice(0, 3).map((est) => (
                  <Card key={est.id} className="cursor-pointer shadow-card hover:shadow-card-hover transition-shadow overflow-hidden" onClick={() => navigate(`/estabelecimento/${est.slug}`)}>
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm leading-tight truncate">{est.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{est.category}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{est.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{(Math.random() * 3 + 0.2).toFixed(1)} km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results list */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredEstablishments.length} resultado(s)
              </p>
              <button
                onClick={() => { setShowMap(true); setActiveFilter(null); setSearch(""); }}
                className="flex items-center gap-1.5 text-xs text-primary font-medium"
              >
                <MapIcon className="w-4 h-4" />
                Ver mapa
              </button>
            </div>
            <div className="space-y-4">
              {filteredEstablishments.map((est) => (
                <Card key={est.id} className="cursor-pointer shadow-card hover:shadow-card-hover transition-shadow overflow-hidden" onClick={() => navigate(`/estabelecimento/${est.slug}`)}>
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={est.image_url} alt={est.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-semibold text-sm leading-tight truncate">{est.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{est.category}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{est.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{(Math.random() * 3 + 0.2).toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
