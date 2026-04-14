import { useState, useEffect } from "react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoutes } from "@/services/routes";

export default function Roteiros() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRoutes().then(({ data }) => {
      if (data) setRoutes(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Roteiros" />

      <main className="max-w-2xl mx-auto pb-24 pt-[64px]">
        {/* Header Section */}
        <div className="px-4 pt-6 pb-8 space-y-1 bg-gradient-to-b from-background to-secondary/20">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Explore <span className="text-primary">Roteiros</span>
          </h1>
          <p className="text-sm text-muted-foreground">Planos prontos para você aproveitar o melhor de Gramado.</p>
        </div>

        <div className="px-4 space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border/50 overflow-hidden">
                <Skeleton className="aspect-[21/9] w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-2/3 rounded-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="grid gap-6">
              {routes.map((route) => (
                <Card 
                  key={route.id} 
                  className="group cursor-pointer rounded-3xl border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  onClick={() => navigate(`/roteiro/${route.slug}`)}
                >
                  <div className="relative aspect-[21/9] overflow-hidden">
                    <img 
                      src={route.image_url} 
                      alt={route.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/80 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-primary/30">
                          {route.duration_days} {route.duration_days === 1 ? 'Dia' : 'Dias'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{route.title}</h3>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between bg-card">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold">{route.items_count || 0} locais</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Star className="w-3.5 h-3.5 text-rating fill-rating" />
                        <span className="text-xs font-bold">{route.rating || '4.8'}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
