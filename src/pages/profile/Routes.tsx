import { ChevronRight, Clock, Mountain } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { MOCK_ROUTES } from "@/data/mock";

export default function RoutesPage() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Roteiros Salvos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        {MOCK_ROUTES.map((route, i) => {
          const Icon = route.icon;
          return (
            <div
              key={route.id}
              className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
              style={{ animationDelay: `${i * 100}ms`, animation: "fadeInUp 0.4s ease-out both" }}
            >
              {/* Cover image */}
              <div className="aspect-[2.5/1] overflow-hidden relative">
                <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-base">{route.title}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{route.description.slice(0, 80)}...</p>
                </div>
              </div>

              {/* Info row */}
              <div className="px-3 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[11px] gap-1 px-2 py-0.5">
                      <Clock className="w-3 h-3" />
                      {route.duration}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] gap-1 px-2 py-0.5">
                      <Mountain className="w-3 h-3" />
                      {route.difficulty}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Stop thumbnails */}
              <div className="px-3 pb-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {route.stops.slice(0, 5).map((stop, j) => (
                    <div key={j} className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-border">
                        <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center w-14 truncate">{stop.name}</span>
                    </div>
                  ))}
                  {route.stops.length > 5 && (
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border-2 border-border">
                        <span className="text-xs font-semibold text-muted-foreground">+{route.stops.length - 5}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">mais</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <BottomNav />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
