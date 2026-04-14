import { useState, useEffect, useRef } from "react";
import { MapPin, Ticket, Map, Award, Camera, Settings, Bookmark, LogOut, ChevronRight, Star, Heart, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getUserBadges } from "@/services/badges";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCoupons } from "@/contexts/CouponsContext";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [badgeCount, setBadgeCount] = useState(0);
  const [stats, setStats] = useState({ reviews: 0 });
  const [loading, setLoading] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { savedPlaces } = useFavorites();
  const { savedCoupons } = useCoupons();

  useEffect(() => {
    if (user) {
      Promise.all([
        getUserBadges(),
        supabase.from('reviews').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]).then(([badgesRes, reviewsRes]) => {
        if (badgesRes.data) {
          setBadgeCount(badgesRes.data.filter((b: any) => b.earned).length);
        }
        setStats({ reviews: reviewsRes.count || 0 });
        setLoading(false);
      });
    }
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar_${Date.now()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar foto");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(path);

    const { error: updateError } = await supabase.from("user_profiles").update({ 
      avatar_url: publicUrl,
      updated_at: new Date().toISOString()
    }).eq("id", user.id);

    if (updateError) {
      toast.error("Erro ao salvar referência da foto");
      return;
    }

    await refreshProfile();
    toast.success("Foto atualizada!");
  }

  const menuItems = [
    { label: "Lugares Salvos", icon: Bookmark, path: "/perfil/salvos", color: "text-blue-500", count: savedPlaces.length },
    { label: "Meus Cupons", icon: Ticket, path: "/perfil/cupons", color: "text-orange-500", count: savedCoupons.length },
    { label: "Meus Roteiros", icon: Map, path: "/perfil/roteiros", color: "text-green-500", count: 0 },
    { label: "Minhas Conquistas", icon: Award, path: "/perfil/badges", color: "text-purple-500", count: badgeCount },
    { label: "Configurações", icon: Settings, path: "/perfil/configuracoes", color: "text-slate-500" },
  ];

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Viajante";
  const initials = displayName.substring(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader title="Perfil" />

      <main className="max-w-2xl mx-auto pb-24 pt-[64px]">
        {/* Profile Header Card */}
        <div className="px-4 pt-8 pb-10 bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-primary-foreground rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background shadow-lg">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          
          <h2 className="mt-5 text-2xl font-black tracking-tight">{displayName}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium">{profile?.city || "Gramado"}, {profile?.state || "RS"}</span>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            {profile?.bio || "Explorando o melhor de Gramado e Canela com o Gramável."}
          </p>
          
          <div className="flex gap-10 mt-8">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{stats.reviews}</span>
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Reviews</span>
            </div>
            <div className="w-px h-8 bg-border/50 self-center" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{badgeCount}</span>
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Badges</span>
            </div>
            <div className="w-px h-8 bg-border/50 self-center" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">0</span>
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Check-ins</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 -mt-6 space-y-3">
          <div className="grid grid-cols-1 gap-2.5">
            {menuItems.map((item) => (
              <Card 
                key={item.label}
                className="group flex items-center gap-4 p-4 cursor-pointer hover:bg-card active:scale-[0.99] transition-all border-border/50 rounded-2xl shadow-sm"
                onClick={() => navigate(item.path)}
              >
                <div className={`w-11 h-11 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="font-black text-sm">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.count} itens</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
              </Card>
            ))}
          </div>

          <Button 
            variant="ghost" 
            className="w-full mt-8 text-destructive hover:text-destructive hover:bg-destructive/5 font-black rounded-2xl h-14 gap-2 transition-colors"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
          
          <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] pt-4 pb-8">
            Gramável v2.0.0
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
