import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { createNotification, getAdminNotifications, sendNotification } from "../services/adminNotifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "", body: "", image_url: "", target: "all", segment: "",
  });

  async function load() {
    const { data } = await getAdminNotifications();
    setNotifications(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!form.title || !form.body) { toast.error("Título e corpo são obrigatórios"); return; }
    const { data, error } = await createNotification(form);
    if (error) { toast.error("Erro ao criar"); return; }
    toast.success("Notificação criada");
    setForm({ title: "", body: "", image_url: "", target: "all", segment: "" });
    load();
  }

  async function handleSend(id: string) {
    const { error } = await sendNotification(id);
    if (error) { toast.error("Erro ao enviar"); return; }
    toast.success("Notificação enviada");
    load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notificações</h2>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Nova Notificação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Título</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Target</Label>
                  <Select value={form.target} onValueChange={v => setForm(p => ({ ...p, target: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="segment">Segmento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Corpo</Label><Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={3} /></div>
              <div><Label>Imagem (URL)</Label><Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} /></div>
              <Button onClick={handleCreate}><Send className="h-4 w-4 mr-2" /> Criar e Enviar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                  ) : notifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell>{n.target ?? "all"}</TableCell>
                      <TableCell>
                        <StatusBadge label={n.sent ? "Enviada" : "Pendente"} variant={n.sent ? "success" : "warning"} />
                      </TableCell>
                      <TableCell>{n.created_at ? new Date(n.created_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-right">
                        {!n.sent && (
                          <Button variant="outline" size="sm" onClick={() => handleSend(n.id)}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Enviar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
