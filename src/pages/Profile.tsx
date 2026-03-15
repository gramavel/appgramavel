import { useState } from "react";
import { MapPin, Ticket, Map, Award, Camera, ChevronRight, CheckCircle2, Star, Pencil, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MOCK_BADGES, MOCK_TIMELINE } from "@/data/mock";
import ImageLightbox from "@/components/ui/ImageLightbox";

const STATS = [
  { label: "Lugares", value: "12", icon: MapPin, color: "text-primary", to: "/perfil/lugares" },
  { label: "Cupons", value: "5", icon: Ticket, color: "text-amber-500", to: "/coupons" },
  { label: "Roteiros", value: "2", icon: Map, color: "text-blue-500", to: "/perfil/roteiros" },
  { label: "Badges", value: String(MOCK_BADGES.filter((b) => b.earned).length), icon: Award, color: "text-yellow-500", to: "/perfil/badges" },
];

const TIMELINE_COLORS: Record<string, string> = {
  visit: "bg-green-100 text-green-600",
  coupon: "bg-amber-100 text-amber-600",
  review: "bg-yellow-100 text-yellow-600",
  route: "bg-blue-100 text-blue-600",
};

const TIMELINE_ICONS: Record<string, typeof CheckCircle2 | typeof Star> = {
  visit: CheckCircle2,
  coupon: Ticket,
  review: Star,
  route: Map,
};

const MEMORIES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop",
];

export default function Profile() {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Meu Gramável" />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-4">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center py-5 gap-2">
          <div className="p-1 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-primary/60">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-xl font-bold text-foreground">João da Silva</h2>
          <p className="text-sm text-muted-foreground text-center">Apaixonado pela Serra Gaúcha</p>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={() => navigate("/perfil/configuracoes")}>
              <Pencil className="w-3.5 h-3.5" />
              Editar perfil
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-muted-foreground">
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around py-3 border-y border-border/50">
          {STATS.map(({ label, value, icon: Icon, color, to }) => (
            <button key={label} onClick={() => navigate(to)} className="flex flex-col items-center hover:opacity-70 transition-opacity">
              <div className="flex items-center gap-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-lg font-bold text-foreground">{value}</span>
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Minha Viagem</h2>
          <div className="space-y-3">
            {MOCK_TIMELINE.map((item) => {
              const TimeIcon = TIMELINE_ICONS[item.type] || CheckCircle2;
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-card/50 rounded-xl border border-border/30 hover:bg-card/80 transition-colors">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.place} className="w-full h-full object-cover" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${TIMELINE_COLORS[item.type]} ring-2 ring-background`}>
                      <TimeIcon className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">{item.action}</span>{" "}
                      <span className="font-medium">{item.place}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memories */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">Memórias ({MEMORIES.length})</span>
            </div>
            <button className="text-xs text-primary font-medium">+ Adicionar</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MEMORIES.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openLightbox(i)}
              >
                <img src={src} alt={`Memória ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
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
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:shadow-sm transition-shadow active:scale-[0.98]"
            >
              <span className="text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </main>

      <BottomNav />

      <ImageLightbox
        images={MEMORIES}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
