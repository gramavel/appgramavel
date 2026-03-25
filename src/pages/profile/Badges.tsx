import { Compass, UtensilsCrossed, Wine, Camera, FerrisWheel, Ticket, CheckCircle2, Lock, CalendarDays } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_BADGES } from "@/data/mock";
import type { ComponentType } from "react";

const BADGE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  compass: Compass,
  "utensils-crossed": UtensilsCrossed,
  wine: Wine,
  camera: Camera,
  "ferris-wheel": FerrisWheel,
  ticket: Ticket,
};

const BADGE_COLOR_PALETTES: Record<string, { bg: string; border: string; icon: string; ring: string }> = {
  compass: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", ring: "#2563eb" },
  "utensils-crossed": { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", ring: "#d97706" },
  wine: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-600", ring: "#e11d48" },
  camera: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", ring: "#0891b2" },
  "ferris-wheel": { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", ring: "#16a34a" },
  ticket: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-600", ring: "#ca8a04" },
};

const EARNED_DATES: Record<string, string> = {
  b1: "08/03/2026",
  b2: "05/03/2026",
  b6: "01/03/2026",
};

function ProgressRing({ progress, total, color, size = 56 }: { progress: number; total: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / total) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-border" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function BadgesPage() {
  const earned = MOCK_BADGES.filter((b) => b.earned);
  const inProgress = MOCK_BADGES.filter((b) => !b.earned);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Minhas Badges" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-6">
        {/* Earned */}
        <div>
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Conquistadas ({earned.length})
          </p>
          <div className="grid grid-cols-2 gap-4">
            {earned.map((b, i) => {
              const BadgeIcon = BADGE_ICONS[b.iconName] || Compass;
              const palette = BADGE_COLOR_PALETTES[b.iconName] || { bg: "bg-primary/10", border: "border-primary/30", icon: "text-primary", ring: "" };
              return (
                <div
                  key={b.id}
                  className={`relative p-4 rounded-xl border-2 ${palette.bg} ${palette.border} overflow-hidden animate-fade-in-scale`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
                  <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                  <BadgeIcon className={`w-8 h-8 mb-2 ${palette.icon}`} />
                  <p className="font-semibold text-sm text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                  {EARNED_DATES[b.id] && (
                    <p className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {EARNED_DATES[b.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* In progress */}
        <div>
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            Em progresso ({inProgress.length})
          </p>
          <div className="grid grid-cols-2 gap-4">
            {inProgress.map((b, i) => {
              const BadgeIcon = BADGE_ICONS[b.iconName] || Compass;
              const palette = BADGE_COLOR_PALETTES[b.iconName] || { bg: "", border: "", icon: "", ring: "#888" };
              return (
                <div
                  key={b.id}
                  className="relative p-4 rounded-xl border-2 border-muted bg-muted/30 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100 + 200}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <BadgeIcon className="w-7 h-7 text-muted-foreground opacity-60" />
                    <div className="relative">
                      <ProgressRing progress={b.progress!} total={b.total!} color={palette.ring} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {b.progress}/{b.total}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-muted-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />

    </div>
  );
}
