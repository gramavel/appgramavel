import { ChevronRight, CheckCircle2, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_ROUTES } from "@/data/mock";
import { cn } from "@/lib/utils";

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

type UserRoute =
  | typeof IN_PROGRESS_ROUTES[number]
  | typeof COMPLETED_ROUTES[number];

function RouteRow({ route }: { route: UserRoute }) {
  const navigate = useNavigate();
  const totalStops = route.stops.length;
  const progress = Math.round((route.completedStops / totalStops) * 100);
  const isCompleted = route.status === "completed";

  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/roteiros/${route.id}`, {
          state: { userStatus: route.status, completedStops: route.completedStops },
        })
      }
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all active:scale-[0.99] text-left min-h-[72px]",
        isCompleted && "opacity-90"
      )}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
          <img
            src={route.image}
            alt={route.title}
            className={cn(
              "w-full h-full object-cover",
              isCompleted && "brightness-95"
            )}
            loading="lazy"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {route.title}
          </h3>
          {isCompleted && (
            <CheckCircle2
              className="w-4 h-4 text-success flex-shrink-0 mt-0.5"
              aria-label="Roteiro concluído"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {totalStops} {totalStops === 1 ? "parada" : "paradas"} · {route.duration}
        </p>

        {!isCompleted && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

export default function RoutesPage() {
  const navigate = useNavigate();

  // Lista única: em andamento primeiro, depois concluídos
  const routes: UserRoute[] = [...IN_PROGRESS_ROUTES, ...COMPLETED_ROUTES];

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Meus Roteiros" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-20">
        {routes.length === 0 ? (
          <EmptyState
            icon={Map}
            title="Nenhum roteiro ainda"
            description="Descubra roteiros prontos e personalizados para aproveitar o melhor de Gramado e Canela."
            actionLabel="Ver roteiros"
            onAction={() => navigate("/roteiros")}
          />
        ) : (
          <div className="space-y-2">
            {routes.map((route, i) => (
              <div
                key={route.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <RouteRow route={route} />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
