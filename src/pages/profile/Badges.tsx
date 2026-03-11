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
      <GlobalHeader showBack title="Minhas Badges" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-6">
        {/* Earned */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            Conquistadas ({earned.length})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {earned.map((b) => (
              <div key={b.id} className="relative p-4 rounded-xl border-2" style={{ borderColor: b.color, backgroundColor: b.color + "15" }}>
                <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="font-semibold text-sm text-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* In progress */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Em progresso ({inProgress.length})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {inProgress.map((b) => (
              <div key={b.id} className="relative p-4 rounded-xl border-2 border-muted bg-muted/30">
                <Lock className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
                <div className="text-3xl mb-2 opacity-50">{b.icon}</div>
                <p className="font-semibold text-sm text-muted-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                <Progress value={(b.progress! / b.total!) * 100} className="h-2 mt-3" />
                <p className="text-xs text-muted-foreground mt-1">{b.progress}/{b.total}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
