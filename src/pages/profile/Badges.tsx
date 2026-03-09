import { CheckCircle2, Lock } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Progress } from "@/components/ui/progress";
import { MOCK_BADGES } from "@/data/mock";

export default function BadgesPage() {
  const earned = MOCK_BADGES.filter((b) => b.earned);
  const inProgress = MOCK_BADGES.filter((b) => !b.earned);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Badges" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-6">
        {/* Earned */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h2 className="text-sm font-semibold">Conquistadas</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {earned.map((b) => (
              <div key={b.id} className="relative p-4 rounded-xl border-2 bg-card" style={{ borderColor: b.color }}>
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                <div className="text-3xl mb-2">{b.icon}</div>
                <h3 className="text-sm font-semibold">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* In progress */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Em progresso</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {inProgress.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border border-muted bg-muted/30">
                <div className="text-3xl mb-2 opacity-50">{b.icon}</div>
                <h3 className="text-sm font-semibold text-muted-foreground">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.description}</p>
                <Progress value={(b.progress! / b.total!) * 100} className="h-2 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">{b.progress}/{b.total}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
