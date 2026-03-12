import { ChevronRight } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_ROUTES } from "@/data/mock";

export default function RoutesPage() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Roteiros Salvos" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-2">
        {MOCK_ROUTES.map((route) => {
          const Icon = route.icon;
          return (
            <button
              key={route.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold">{route.title}</p>
                <p className="text-xs text-muted-foreground">{route.subtitle}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </main>
      <BottomNav />
    </div>
  );
}
