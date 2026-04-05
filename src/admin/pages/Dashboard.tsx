import { useEffect, useState } from "react";
import { StatCard } from "../components/ui/StatCard";
import { MapPin, Users, Ticket, Route, Rss, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    establishments: 0,
    users: 0,
    coupons: 0,
    routes: 0,
    posts: 0,
    reviews: 0,
  });

  useEffect(() => {
    async function load() {
      const [est, usr, coup, rts, pst, rev] = await Promise.all([
        supabase.from("establishments").select("*", { count: "exact", head: true }),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("coupons").select("*", { count: "exact", head: true }),
        supabase.from("routes").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        establishments: est.count ?? 0,
        users: usr.count ?? 0,
        coupons: coup.count ?? 0,
        routes: rts.count ?? 0,
        posts: pst.count ?? 0,
        reviews: rev.count ?? 0,
      });
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visão Geral</h2>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Estabelecimentos" value={stats.establishments} icon={MapPin} />
        <StatCard title="Usuários" value={stats.users} icon={Users} />
        <StatCard title="Cupons" value={stats.coupons} icon={Ticket} />
        <StatCard title="Roteiros" value={stats.routes} icon={Route} />
        <StatCard title="Posts" value={stats.posts} icon={Rss} />
        <StatCard title="Avaliações" value={stats.reviews} icon={Star} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Painel de atividade em tempo real será exibido aqui conforme o uso do app crescer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
