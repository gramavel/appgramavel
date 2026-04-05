import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pencil, Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { getRouteInsights } from "../services/adminAnalytics";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [insights, setInsights] = useState<{ title: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: r }, { data: b }, ins] = await Promise.all([
      supabase.from("routes").select("*, route_stops(id)").order("sort_order"),
      supabase.from("route_banners").select("*").order("sort_order"),
      getRouteInsights(),
    ]);
    setRoutes(r ?? []);
    setBanners(b ?? []);
    setInsights(ins);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from("routes").update({ is_featured: !current } as never).eq("id", id);
    load();
  }

  async function toggleBanner(id: string, current: boolean) {
    await supabase.from("route_banners").update({ active: !current } as never).eq("id", id);
    load();
  }

  async function deleteBanner(id: string) {
    await supabase.from("route_banners").delete().eq("id", id);
    toast.success("Banner removido");
    load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Roteiros</h2>

      {/* Routes table */}
      <Card>
        <CardHeader><CardTitle>Roteiros Sugeridos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Paradas</TableHead>
                <TableHead>Destaque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : routes.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.duration}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={r.difficulty ?? "Fácil"}
                      variant={r.difficulty === "Difícil" ? "destructive" : r.difficulty === "Moderado" ? "warning" : "success"}
                    />
                  </TableCell>
                  <TableCell>{r.route_stops?.length ?? 0}</TableCell>
                  <TableCell><Switch checked={r.is_featured ?? false} onCheckedChange={() => toggleFeatured(r.id, r.is_featured)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Banners */}
      <Card>
        <CardHeader><CardTitle>Banners de Destaque</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell><Switch checked={b.active} onCheckedChange={() => toggleBanner(b.id, b.active)} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteBanner(b.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Nenhum banner</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Roteiros Mais Completados</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Completados</TableHead></TableRow></TableHeader>
              <TableBody>
                {insights.map((ins, i) => (
                  <TableRow key={i}><TableCell>{ins.title}</TableCell><TableCell>{ins.count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
