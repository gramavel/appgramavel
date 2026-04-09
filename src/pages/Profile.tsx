import { useState, useEffect } from "react";
import { MapPin, Ticket, Map, Award, Camera, CheckCircle2, Star, Pencil, TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { useAuth } from "@/contexts/AuthContext";
import { getTimeline } from "@/services/timeline";
import { getMemories } from "@/services/memories";
import { getUserBadges } from "@/services/badges";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCoupons } from "@/contexts/CouponsContext";

const TIMELINE_COLORS: Record<string, string> = {
  visit: "bg-success/10 text-success",
  coupon: "bg-warning/10 text-warning",
  review: "bg-rating/10 text-rating",
  route: "bg-primary/10 text-primary",
};

const TIMELINE_ICONS: Record<string, typeof CheckCircle2 | typeof Star> = {
  visit: CheckCircle2,
  coupon: Ticket,
  review: Star,
  route: Map,
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [memories, setMemories] = useState<{ src: string; caption: string }[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { savedPlaces } = useFavorites();
  const { savedCoupons } = useCoupons();

  useEffect(() => {
    Promise.all([
      getTimeline(),
      getMemories(),
      getUserBadges(),
    ]).then(([timelineRes, memoriesRes, badgesRes]) => {
      if (timelineRes.data && timelineRes.data.length > 0) {
        setTimeline(timelineRes.data.map((t: any) => ({
          id: t.id,
          type: t.type,
          action: t.action,
          place: t.establishment?.name || "",
          image: t.image_url || t.establishment?.logo_url || "",
          date: t.created_at,
        })));
      }
      if (memoriesRes.data && memoriesRes.data.length > 0) {
        setMemories(memoriesRes.data.map((m: any) => ({
          src: m.image_url,
          caption: m.caption || "",
        })));
      }
      if (badgesRes.data) {
        setBadgeCount(badgesRes.data.filter((b: any) => b.earned).length);
      }
      setLoading(false);
    });
  }, []);

  const STATS = [
    { label: "Lugares", value: String(savedPlaces.length), icon: MapPin, to: "/perfil/lugares" },
    { label: "Cupons", value: String(savedCoupons.length), icon: Ticket, to: "/perfil/cupons" },
    { label: "Roteiros", value: "0", icon: Map, to: "/perfil/roteiros" },
    { label: "Badges", value: String(badgeCount), icon: Award, to: "/perfil/badges" },
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const displayName = profile?.name || user?.email?.split("@")[0] || "Usuário";
  const avatarUrl = profile?.avatar_url || "";
  const city = profile?.city || "";
  const state = profile?.state || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Meu Gramável" />

      <main className="max-w-2xl mx-auto pb-20 space-y-4 mt-[72px]">
        {/* Cover + Avatar Section */}
        <div className="relative">
          <div className="h-28 bg-gradient-primary relative overflow-hidden">
            {profile?.cover_url && (
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url('${profile.cover_url}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "overlay"
              }} />
            )}
          </div>

          <div className="flex flex-col items-center -mt-11 relative z-10 px-4">
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-primary to-primary/60 shadow-lg">
              <Avatar className="w-[88px] h-[88px] border-[3px] border-background">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            <h1 className="text-lg font-bold text-foreground mt-2">{displayName}</h1>

            {(city || state) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {[city, state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

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
        {timeline.length > 0 && (
          <div className="px-4">
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border" />
              <div className="space-y-2">
                {timeline.slice(0, 3).map((item, idx) => {
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
                        <img src={item.image || "/placeholder.svg"} alt={item.place} className="w-full h-full object-cover" />
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
        )}

        {/* Empty state for timeline — skeleton placeholder */}
        {!loading && timeline.length === 0 && (
          <div className="px-4 space-y-2">
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border/40" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative flex items-center gap-4 p-4 bg-card/40 rounded-xl border border-border/20 mb-2">
                  <div className="absolute -left-6 w-[18px] h-[18px] rounded-full bg-muted ring-2 ring-background" />
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-1">Sua linha do tempo está vazia. Explore e faça check-ins!</p>
          </div>
        )}

        {/* Memories */}
        {memories.length > 0 && (
          <div className="px-4">
            <div className="grid grid-cols-3 gap-1.5">
              {memories.slice(0, 12).map((mem, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative"
                  onClick={() => openLightbox(i)}
                >
                  <img src={mem.src} alt={mem.caption} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all flex items-center justify-center">
                    <Heart className="h-4 w-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for memories — skeleton grid */}
        {!loading && memories.length === 0 && (
          <div className="px-4 space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-1">Nenhuma memória ainda. Adicione fotos das suas viagens!</p>
          </div>
        )}

        <div className="px-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full gap-1.5 h-9 text-xs font-medium"
          >
            <Camera className="w-3.5 h-3.5" />
            Adicionar fotos
          </Button>
        </div>
      </main>

      <BottomNav />

      {memories.length > 0 && (
        <ImageLightbox
          images={memories.slice(0, 12).map(m => m.src)}
          captions={memories.slice(0, 12).map(m => m.caption)}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          aspectRatio="4/5"
        />
      )}
    </div>
  );
}
