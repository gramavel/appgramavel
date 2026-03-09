import { MapPin, Ticket, Map, Award, Camera, Plus, ChevronRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MOCK_BADGES, MOCK_TIMELINE } from "@/data/mock";

const STATS = [
  { label: "Lugares", value: 12, icon: MapPin, color: "text-primary", to: "/perfil/lugares" },
  { label: "Cupons", value: 5, icon: Ticket, color: "text-amber-500", to: "/perfil/badges" },
  { label: "Roteiros", value: 3, icon: Map, color: "text-blue-500", to: "/perfil/roteiros" },
  { label: "Badges", value: MOCK_BADGES.filter((b) => b.earned).length, icon: Award, color: "text-yellow-500", to: "/perfil/badges" },
];

const TIMELINE_COLORS = {
  visit: "bg-green-100 text-green-600",
  coupon: "bg-amber-100 text-amber-600",
  review: "bg-yellow-100 text-yellow-600",
  route: "bg-blue-100 text-blue-600",
};

const MEMORIES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=300&fit=crop",
];

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Perfil" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="https://i.pravatar.cc/200?img=5"
            alt="Perfil"
            className="w-20 h-20 rounded-full border-4 border-border object-cover"
          />
          <h2 className="text-lg font-bold">Ana Silva</h2>
          <p className="text-sm text-muted-foreground">Explorando a Serra Gaúcha ✨</p>
        </div>

        {/* Stats */}
        <div className="flex justify-around py-4 border-y border-border/50">
          {STATS.map(({ label, value, icon: Icon, color, to }) => (
            <button key={label} onClick={() => navigate(to)} className="flex flex-col items-center gap-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-lg font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Badges preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Badges</h2>
            <button onClick={() => navigate("/perfil/badges")} className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {MOCK_BADGES.filter((b) => b.earned).map((badge) => (
              <div key={badge.id} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: badge.color + "20" }}>
                  {badge.icon}
                </div>
                <span className="text-[10px] font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Minha Viagem</h2>
          <div className="bg-card/50 rounded-xl border border-border/30 divide-y divide-border/30">
            {MOCK_TIMELINE.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <div className="relative shrink-0">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-background flex items-center justify-center ${TIMELINE_COLORS[item.type]}`}>
                    <CheckCircle className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{item.action}</span>{" "}
                    <span className="text-muted-foreground">{item.place}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <h2 className="text-sm font-semibold">Memórias ({MEMORIES.length})</h2>
            </div>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MEMORIES.map((src, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          {[
            { label: "Lugares Salvos", to: "/perfil/lugares" },
            { label: "Roteiros Salvos", to: "/perfil/roteiros" },
            { label: "Configurações", to: "/perfil/configuracoes" },
          ].map(({ label, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:shadow-sm transition-shadow"
            >
              <span className="text-sm font-medium">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
