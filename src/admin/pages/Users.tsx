import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StatCard } from "../components/ui/StatCard";
import { Users as UsersIcon, MapPin, Search, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserStats } from "../services/adminAnalytics";

export default function UsersPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, topCities: [] as { city: string; count: number }[] });

  useEffect(() => {
    async function load() {
      const [{ data }, userStats] = await Promise.all([
        supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),
        getUserStats(),
      ]);
      setProfiles(data ?? []);
      setStats(userStats);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = profiles.filter(p =>
    (p.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usuários</h2>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total de Usuários" value={stats.totalUsers} icon={UsersIcon} />
        <StatCard
          title="Top Cidade"
          value={stats.topCities[0]?.city ?? "—"}
          subtitle={stats.topCities[0] ? `${stats.topCities[0].count} usuários` : ""}
          icon={MapPin}
        />
        <StatCard title="Cidades Ativas" value={stats.topCities.length} icon={TrendingUp} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Viajando desde</TableHead>
              <TableHead>Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</TableCell></TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar_url ?? ""} />
                      <AvatarFallback>{(p.name ?? "U")[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.name ?? "Sem nome"}</span>
                  </div>
                </TableCell>
                <TableCell>{p.city ?? "—"}</TableCell>
                <TableCell>{p.state ?? "—"}</TableCell>
                <TableCell>{p.travel_since ?? "—"}</TableCell>
                <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
