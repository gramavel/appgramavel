import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Establishment = Tables<"establishments">;

const CATEGORIES = ["Todos", "Restaurantes", "Cafés", "Hotéis", "Atrações", "Compras", "Bares & Vinícolas"];

export default function Establishments() {
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  async function load() {
    setLoading(true);
    let query = supabase.from("establishments").select("*").order("name");
    if (category !== "Todos") query = query.eq("category", category);
    const { data } = await query;
    setEstablishments(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [category]);

  const filtered = establishments.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    const { error } = await supabase.from("establishments").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Estabelecimento excluído");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estabelecimentos</h2>
        <Button onClick={() => navigate("/admin/estabelecimentos/novo")}>
          <Plus className="h-4 w-4 mr-2" /> Novo estabelecimento
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Img</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Popular</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum estabelecimento encontrado</TableCell></TableRow>
            ) : filtered.map(est => (
              <TableRow key={est.id}>
                <TableCell>
                  {est.image_url ? (
                    <img src={est.image_url} alt={est.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{est.name}</TableCell>
                <TableCell>{est.category}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-rating text-rating" />
                    {est.rating?.toFixed(1) ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge label={est.is_open ? "Aberto" : "Fechado"} variant={est.is_open ? "success" : "destructive"} />
                </TableCell>
                <TableCell>
                  {est.is_popular && <StatusBadge label="Popular" variant="info" />}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/estabelecimentos/${est.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir estabelecimento?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita. O estabelecimento "{est.name}" será removido permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(est.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
