import { useState } from "react";
import { MapPin, Ticket, Map, Award, Camera, CheckCircle2, Star, Pencil, TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { MOCK_BADGES, MOCK_TIMELINE } from "@/data/mock";
import ImageLightbox from "@/components/ui/ImageLightbox";

const STATS = [
  { label: "Lugares", value: "12", icon: MapPin, to: "/perfil/lugares" },
  { label: "Cupons", value: "5", icon: Ticket, to: "/perfil/cupons" },
  { label: "Roteiros", value: "2", icon: Map, to: "/perfil/roteiros" },
  { label: "Badges", value: String(MOCK_BADGES.filter((b) => b.earned).length), icon: Award, to: "/perfil/badges" },
];

const TIMELINE_COLORS: Record<string, string> = {
  visit: "bg-green-500/10 text-green-600",
  coupon: "bg-amber-500/10 text-amber-600",
  review: "bg-yellow-500/10 text-yellow-600",
  route: "bg-primary/10 text-primary",
};

const TIMELINE_ICONS: Record<string, typeof CheckCircle2 | typeof Star> = {
  visit: CheckCircle2,
  coupon: Ticket,
  review: Star,
  route: Map,
};

const MEMORIES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop", caption: "Lago Negro" },
  { src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", caption: "Café Colonial" },
  { src: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=400&fit=crop", caption: "Pôr do sol" },
  { src: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=400&fit=crop", caption: "Rua Coberta" },
  { src: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=400&h=400&fit=crop", caption: "Chocolate artesanal" },
  { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop", caption: "Montanha nevada" },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop", caption: "Jantar especial" },
  { src: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=400&fit=crop", caption: "Café da manhã" },
  { src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=400&fit=crop", caption: "Vinícola" },
  { src: "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=400&h=400&fit=crop", caption: "Vista panorâmica" },
  { src: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop", caption: "Praça" },
  { src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=400&fit=crop", caption: "Hotel aconchegante" },
  { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop", caption: "Trilha na serra" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop", caption: "Gastronomia local" },
  { src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop", caption: "Paisagem de inverno" },
  { src: "https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?w=400&h=400&fit=crop", caption: "Fondue perfeito" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop", caption: "Vale do Quilombo" },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop", caption: "Prato típico" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const earnedBadges = MOCK_BADGES.filter(b => b.earned).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Meu Gramável" />

      <main className="max-w-2xl mx-auto pb-20 space-y-6 mt-[72px]">
        {/* Cover + Avatar Section */}
        <div className="relative">
          <div className="h-28 bg-gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "overlay"
            }} />
          </div>

          <div className="flex flex-col items-center -mt-14 relative z-10 px-4">
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-primary to-primary/60 shadow-lg">
              <Avatar className="w-[88px] h-[88px] border-[3px] border-background">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>

            <h1 className="text-lg font-bold text-foreground mt-2">João da Silva</h1>

            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Gramado, RS</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">Viajando há 5 dias</span>
            </div>

            <div className="flex justify-center mt-4 mb-4">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-xs" onClick={() => navigate("/perfil/configuracoes")}>
                <Pencil className="w-3 h-3" />
                Editar perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-around py-4 mx-4 bg-card rounded-xl border border-border/50 shadow-card">
          {STATS.map(({ label, value, icon: Icon, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex flex-col items-center hover:opacity-70 transition-opacity active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground leading-none">{value}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
            </button>
          ))}
        </div>


        {/* Timeline Preview */}
        <div className="px-4">
          <div className="relative pl-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border" />

            <div className="space-y-2">
              {MOCK_TIMELINE.slice(0, 3).map((item, idx) => {
                const TimeIcon = TIMELINE_ICONS[item.type] || CheckCircle2;
                return (
                  <div
                    key={item.id}
                    className="relative flex items-center gap-4 p-4 bg-card/60 rounded-xl border border-border/30 hover:bg-card transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className={`absolute -left-6 w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-background ${TIMELINE_COLORS[item.type]}`}>
                      <TimeIcon className="w-3 h-3" />
                    </div>

                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.place} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-semibold">{item.place}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 rounded-full gap-1.5 h-9 text-xs font-medium"
            onClick={() => navigate("/perfil/timeline")}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Ver linha do tempo completa
          </Button>
        </div>

        {/* Memories */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-1.5">
            {MEMORIES.slice(0, 12).map((mem, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={mem.src}
                  alt={mem.caption}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 rounded-full gap-1.5 h-9 text-xs font-medium"
          >
            <Camera className="w-3.5 h-3.5" />
            Adicionar fotos
          </Button>
        </div>
      </main>

      <BottomNav />

      <ImageLightbox
        images={MEMORIES.slice(0, 12).map(m => m.src)}
        captions={MEMORIES.slice(0, 12).map(m => m.caption)}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        aspectRatio="4/5"
      />

    </div>
  );
}
