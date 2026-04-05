import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Restaurantes", "Cafés", "Hotéis", "Atrações", "Compras", "Bares & Vinícolas"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function EstablishmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", category: "Restaurantes", description: "",
    address: "", latitude: "", longitude: "", distance_km: "",
    is_open: true, is_popular: false, pet_friendly: false,
    opening_hours: "", sunday_hours: "",
    phone: "", whatsapp: "", website: "", instagram: "", tiktok: "", facebook: "",
    image_url: "",
  });

  const [photos, setPhotos] = useState<{ id?: string; url: string; caption: string; sort_order: number }[]>([]);

  useEffect(() => {
    if (isEditing) {
      supabase.from("establishments").select("*").eq("id", id).single().then(({ data }) => {
        if (!data) return;
        setForm({
          name: data.name ?? "",
          slug: data.slug ?? "",
          category: data.category ?? "Restaurantes",
          description: data.description ?? "",
          address: data.address ?? "",
          latitude: String(data.latitude ?? ""),
          longitude: String(data.longitude ?? ""),
          distance_km: String(data.distance_km ?? ""),
          is_open: data.is_open ?? true,
          is_popular: data.is_popular ?? false,
          pet_friendly: data.pet_friendly ?? false,
          opening_hours: data.opening_hours ?? "",
          sunday_hours: data.sunday_hours ?? "",
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? "",
          website: data.website ?? "",
          instagram: data.instagram ?? "",
          tiktok: data.tiktok ?? "",
          facebook: data.facebook ?? "",
          image_url: data.image_url ?? "",
        });
      });
      supabase.from("establishment_photos").select("*").eq("establishment_id", id).order("sort_order").then(({ data }) => {
        setPhotos(data?.map(p => ({ id: p.id, url: p.url, caption: p.caption ?? "", sort_order: p.sort_order ?? 0 })) ?? []);
      });
    }
  }, [id]);

  function updateField(key: string, value: unknown) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "name") next.slug = slugify(value as string);
      return next;
    });
  }

  async function handleSave() {
    if (!form.name || !form.slug) { toast.error("Nome e slug são obrigatórios"); return; }
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      description: form.description || null,
      address: form.address || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
      is_open: form.is_open,
      is_popular: form.is_popular,
      pet_friendly: form.pet_friendly,
      opening_hours: form.opening_hours || null,
      sunday_hours: form.sunday_hours || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      website: form.website || null,
      instagram: form.instagram || null,
      tiktok: form.tiktok || null,
      facebook: form.facebook || null,
      image_url: form.image_url || null,
    };

    let estId = id;

    if (isEditing) {
      const { error } = await supabase.from("establishments").update(payload as never).eq("id", id);
      if (error) { toast.error("Erro ao salvar"); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("establishments").insert(payload as never).select().single();
      if (error || !data) { toast.error("Erro ao criar"); setSaving(false); return; }
      estId = data.id;
    }

    // Save photos
    for (const photo of photos) {
      if (photo.id) {
        await supabase.from("establishment_photos").update({ caption: photo.caption, sort_order: photo.sort_order } as never).eq("id", photo.id);
      } else if (estId) {
        await supabase.from("establishment_photos").insert({
          establishment_id: estId, url: photo.url, caption: photo.caption, sort_order: photo.sort_order,
        });
      }
    }

    toast.success(isEditing ? "Estabelecimento atualizado" : "Estabelecimento criado");
    setSaving(false);
    navigate("/admin/estabelecimentos");
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
      updateField("latitude", String(pos.coords.latitude));
      updateField("longitude", String(pos.coords.longitude));
      toast.success("Localização obtida");
    }, () => toast.error("Erro ao obter localização"));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/estabelecimentos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">{isEditing ? "Editar" : "Novo"} Estabelecimento</h2>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => updateField("name", e.target.value)} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => updateField("slug", e.target.value)} /></div>
          </div>
          <div><Label>Categoria</Label>
            <Select value={form.category} onValueChange={v => updateField("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => updateField("description", e.target.value)} rows={3} /></div>
          <div><Label>URL da Imagem Principal</Label><Input value={form.image_url} onChange={e => updateField("image_url", e.target.value)} placeholder="https://..." /></div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle>Localização</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Endereço</Label><Input value={form.address} onChange={e => updateField("address", e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Latitude</Label><Input type="number" value={form.latitude} onChange={e => updateField("latitude", e.target.value)} /></div>
            <div><Label>Longitude</Label><Input type="number" value={form.longitude} onChange={e => updateField("longitude", e.target.value)} /></div>
            <div><Label>Distância (km)</Label><Input type="number" value={form.distance_km} onChange={e => updateField("distance_km", e.target.value)} /></div>
          </div>
          <Button variant="outline" size="sm" onClick={useMyLocation}><MapPin className="h-4 w-4 mr-2" /> Usar minha localização</Button>
        </CardContent>
      </Card>

      {/* Operation */}
      <Card>
        <CardHeader><CardTitle>Funcionamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Switch checked={form.is_open} onCheckedChange={v => updateField("is_open", v)} /><Label>Aberto</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_popular} onCheckedChange={v => updateField("is_popular", v)} /><Label>Popular</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.pet_friendly} onCheckedChange={v => updateField("pet_friendly", v)} /><Label>Pet Friendly</Label></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Horários (Seg-Sáb)</Label><Input value={form.opening_hours} onChange={e => updateField("opening_hours", e.target.value)} placeholder="08h às 22h" /></div>
            <div><Label>Horário Domingo</Label><Input value={form.sunday_hours} onChange={e => updateField("sunday_hours", e.target.value)} placeholder="10h às 18h" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader><CardTitle>Contato</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Telefone</Label><Input value={form.phone} onChange={e => updateField("phone", e.target.value)} /></div>
            <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => updateField("whatsapp", e.target.value)} /></div>
            <div><Label>Site</Label><Input value={form.website} onChange={e => updateField("website", e.target.value)} /></div>
            <div><Label>Instagram</Label><Input value={form.instagram} onChange={e => updateField("instagram", e.target.value)} /></div>
            <div><Label>TikTok</Label><Input value={form.tiktok} onChange={e => updateField("tiktok", e.target.value)} /></div>
            <div><Label>Facebook</Label><Input value={form.facebook} onChange={e => updateField("facebook", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Galeria ({photos.length}/12)</CardTitle>
            {photos.length < 12 && (
              <Button variant="outline" size="sm" onClick={() => setPhotos(p => [...p, { url: "", caption: "", sort_order: p.length }])}>
                Adicionar foto
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {photos.map((photo, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              {photo.url ? (
                <img src={photo.url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <Input placeholder="URL da imagem" value={photo.url} onChange={e => {
                  const next = [...photos]; next[i] = { ...next[i], url: e.target.value }; setPhotos(next);
                }} />
                <Input placeholder="Legenda" value={photo.caption} onChange={e => {
                  const next = [...photos]; next[i] = { ...next[i], caption: e.target.value }; setPhotos(next);
                }} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate("/admin/estabelecimentos")}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
