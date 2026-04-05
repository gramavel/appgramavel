import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save, Star } from "lucide-react";
import { getTopSearches } from "../services/adminAnalytics";
import { toast } from "sonner";

export default function ExplorePage() {
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [newExp, setNewExp] = useState({ title: "", description: "", image_url: "", sort_order: 0 });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    // Categories
    const { data: ests } = await supabase.from("establishments").select("category");
    const catMap: Record<string, number> = {};
    ests?.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + 1; });
    setCategories(Object.entries(catMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count));

    // Popular
    const { data: pop } = await supabase.from("establishments").select("id, name, rating, is_popular").eq("is_popular", true).order("rating", { ascending: false }).limit(6);
    setPopular(pop ?? []);

    // Searches
    const { data: s } = await getTopSearches(20);
    setSearches(s ?? []);

    // Experiences
    const { data: exp } = await supabase.from("experiences").select("*").order("sort_order");
    setExperiences(exp ?? []);
  }

  async function togglePopular(id: string, current: boolean) {
    await supabase.from("establishments").update({ is_popular: !current } as never).eq("id", id);
    loadAll();
  }

  async function saveExperience() {
    if (!newExp.title) return;
    await supabase.from("experiences").insert(newExp as never);
    setNewExp({ title: "", description: "", image_url: "", sort_order: experiences.length });
    toast.success("Experiência adicionada");
    loadAll();
  }

  async function deleteExperience(id: string) {
    await supabase.from("experiences").delete().eq("id", id);
    toast.success("Experiência removida");
    loadAll();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Explorar</h2>

      {/* Categories */}
      <Card>
        <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <Badge key={c.category} variant="secondary" className="text-sm py-1.5 px-3">
                {c.category} ({c.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular */}
      <Card>
        <CardHeader><CardTitle>Populares agora</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Popular</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popular.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-rating text-rating" />{e.rating?.toFixed(1)}</span></TableCell>
                  <TableCell><Switch checked={e.is_popular} onCheckedChange={() => togglePopular(e.id, e.is_popular)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Searches */}
      <Card>
        <CardHeader><CardTitle>Buscas Frequentes</CardTitle></CardHeader>
        <CardContent>
          {searches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma busca registrada</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {searches.map((s, i) => (
                <Badge key={i} variant="outline" className="text-sm">{s.query} ({s.results})</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experiences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Experiências</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1"><Input placeholder="Título" value={newExp.title} onChange={e => setNewExp(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="flex-1"><Input placeholder="URL da imagem" value={newExp.image_url} onChange={e => setNewExp(p => ({ ...p, image_url: e.target.value }))} /></div>
            <Button onClick={saveExperience}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map(exp => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium">{exp.title}</TableCell>
                  <TableCell>{exp.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
