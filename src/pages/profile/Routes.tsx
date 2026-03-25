import { useState } from "react";
import { ChevronRight, Clock, MapPin, CheckCircle2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_ROUTES } from "@/data/mock";
import { Progress } from "@/components/ui/progress";

const IN_PROGRESS_ROUTES = [
  {
    ...MOCK_ROUTES[0],
    status: "in_progress" as const,
    completedStops: 3,
    startedAt: "2026-03-18",
  },
  {
    ...MOCK_ROUTES[4],
    status: "in_progress" as const,
    completedStops: 1,
    startedAt: "2026-03-20",
  },
];

const COMPLETED_ROUTES = [
  {
    ...MOCK_ROUTES[3],
    status: "completed" as const,
    completedStops: MOCK_ROUTES[3].stops.length,
    startedAt: "2026-03-10",
    completedAt: "2026-03-12",
  },
  {
    ...MOCK_ROUTES[1],
    status: "completed" as const,
    completedStops: MOCK_ROUTES[1].stops.length,
    startedAt: "2026-03-01",
    completedAt: "2026-03-02",
  },
];

type UserRoute = typeof IN_PROGRESS_ROUTES[number] | typeof COMPLETED_ROUTES[number];

function RouteCard({ route }: { route: UserRoute }) {
  const navigate = useNavigate();
  const totalStops = route.stops.length;
  const progress = Math.round((route.completedStops / totalStops) * 100);
  const isCompleted = route.status === "completed";

  return (
    <div
      className="rounded-xl bg-card border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] cursor-pointer"
      onClick={() => navigate("/roteiros")}
    >
      {/* Cover */}
      <div className="aspect-[2.5/1] overflow-hidden relative">
        <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 right-4">
          <Badge
            className={`text-xs px-2 py-0.5 border-0 ${
              isCompleted
                ? "bg-green-500/90 text-primary-foreground"
                : "bg-primary/90 text-primary-foreground"
            }`}
          >
            {isCompleted ? (
              <><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</>
            ) : (
              <><Play className="w-3 h-3 mr-1" /> Em andamento</>
            )}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-primary-foreground font-bold text-sm">{route.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary-foreground/80 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {route.completedStops}/{totalStops} paradas
            </span>
            <span className="text-primary-foreground/80 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {route.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Progress + stops */}
      <div className="px-4 py-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className="text-xs font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Stop thumbnails */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {route.stops.slice(0, 6).map((stop, j) => (
            <div key={j} className="relative flex-shrink-0">
              <div className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${
                j < route.completedStops ? "border-green-500" : "border-border opacity-50"
              }`}>
                <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
              </div>
              {j < route.completedStops && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-card">
                  <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {route.stops.length > 6 && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border-2 border-border">
              <span className="text-xs font-semibold text-muted-foreground">+{route.stops.length - 6}</span>
            </div>
          )}
        </div>

        {/* Date info */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isCompleted
              ? `Concluído em ${new Date((route as typeof COMPLETED_ROUTES[number]).completedAt).toLocaleDateString("pt-BR")}`
              : `Iniciado em ${new Date(route.startedAt).toLocaleDateString("pt-BR")}`
            }
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export default function RoutesPage() {
  const [tab, setTab] = useState("in_progress");

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Meus Roteiros" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="in_progress" className="gap-1.5 text-sm">
              <Play className="w-4 h-4" /> Em andamento ({IN_PROGRESS_ROUTES.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Concluídos ({COMPLETED_ROUTES.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in_progress" className="mt-4 space-y-4">
            {IN_PROGRESS_ROUTES.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Play className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Nenhum roteiro em andamento</p>
                <p className="text-xs text-muted-foreground mt-1">Inicie um roteiro na aba Roteiros</p>
              </div>
            ) : (
              IN_PROGRESS_ROUTES.map((route, i) => (
                <div
                  key={route.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <RouteCard route={route} />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {COMPLETED_ROUTES.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Nenhum roteiro concluído</p>
                <p className="text-xs text-muted-foreground mt-1">Complete um roteiro para vê-lo aqui</p>
              </div>
            ) : (
              COMPLETED_ROUTES.map((route, i) => (
                <div
                  key={route.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <RouteCard route={route} />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

    </div>
  );
}
