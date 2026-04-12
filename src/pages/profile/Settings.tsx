import { useState, useRef, useEffect } from "react";
import { Camera, Save, LogOut, Bell, Pencil, X } from "lucide-react";
import { AgeScrollPicker } from "@/components/ui/AgeScrollPicker";
import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ImageUploadCrop from "@/admin/components/ImageUploadCrop";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ESTADOS_BR = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" },
  { uf: "AM", nome: "Amazonas" }, { uf: "AP", nome: "Amapá" },
  { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" }, { uf: "MA", nome: "Maranhão" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MT", nome: "Mato Grosso" }, { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" }, { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" }, { uf: "PR", nome: "Paraná" },
  { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RO", nome: "Rondônia" }, { uf: "RR", nome: "Roraima" },
  { uf: "RS", nome: "Rio Grande do Sul" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SE", nome: "Sergipe" }, { uf: "SP", nome: "São Paulo" },
  { uf: "TO", nome: "Tocantins" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    state: "",
    bio: "",
    age: null as number | null,
    gender: "",
    phone: "",
    avatar_url: "",
  });

  function birthDateToAge(bd: string | null): number | null {
    if (!bd) return null;
    const diff = Date.now() - new Date(bd).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  function ageToBirthDate(age: number): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - age);
    return d.toISOString().split("T")[0];
  }

  // Populate form with real data when profile loads
  useEffect(() => {
    if (!profile || !user) return;
    setForm({
      name: profile.name ?? "",
      email: user.email ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      bio: profile.bio ?? "",
      age: birthDateToAge(profile.birth_date),
      gender: (profile as any).gender ?? "",
      phone: profile.phone ?? "",
      avatar_url: profile.avatar_url ?? "",
    });
  }, [profile?.id, user?.id]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const displayName = profile?.name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuário";
  const avatarUrl = form.avatar_url || profile?.avatar_url || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  function handleCancel() {
    setIsEditing(false);
    if (profile && user) {
      setForm({
        name: profile.name ?? "",
        email: user.email ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        bio: profile.bio ?? "",
        age: birthDateToAge(profile.birth_date),
        gender: (profile as any).gender ?? "",
        phone: profile.phone ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
    }
  }

  async function handleAvatarSave(publicUrl: string) {
    if (!user) return;
    
    // Optimistic update to UI
    setForm(prev => ({ ...prev, avatar_url: publicUrl }));

    const { error } = await supabase
      .from("user_profiles")
      .update({ 
        avatar_url: publicUrl, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving avatar:", error);
      toast.error("Erro ao salvar foto de perfil");
      // Revert if error
      if (profile) setForm(prev => ({ ...prev, avatar_url: profile.avatar_url }));
      return;
    }
    
    await refreshProfile();
    toast.success("Foto de perfil atualizada!");
  }

  async function handleSave() {
    if (!user || !profile) return;
    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          name: form.name.trim() || null,
          city: form.city.trim() || null,
          state: form.state || null,
          phone: form.phone.trim() || null,
          bio: form.bio.trim() || null,
          birth_date: form.birth_date || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        toast.error(`Erro ao salvar: ${profileError.message}`);
        return;
      }

      if (form.email.trim() !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: form.email.trim(),
        });
        if (emailError) {
          toast.error("Perfil salvo, mas erro ao atualizar e-mail: " + emailError.message);
        } else {
          toast.success("Perfil salvo! Confirme o novo e-mail na sua caixa de entrada.", { duration: 6000 });
        }
      } else {
        toast.success("Perfil atualizado com sucesso!");
      }

      await refreshProfile();
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Meu perfil" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-20 space-y-6">
        {/* Avatar with crop */}
        <div className="flex flex-col items-center">
          <ImageUploadCrop
            value={avatarUrl || null}
            onChange={handleAvatarSave}
            aspect={1}
            bucket="user-avatars"
            storagePath={`${user?.id ?? "unknown"}/avatar_`}
            label="Foto de perfil"
            renderTrigger={() => (
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-border">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} className="object-cover" />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground mt-2">Toque para alterar a foto</p>
        </div>

        {/* Edit / Cancel+Save buttons */}
        <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Dados pessoais</h2>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-xs bg-background" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size="sm" className="rounded-full h-8 text-xs gap-1" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Nome</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} disabled={!isEditing} className={`h-10 text-sm ${!isEditing ? "opacity-70 cursor-default" : ""}`} />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">E-mail</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={!isEditing} className={`h-10 text-sm ${!isEditing ? "opacity-70 cursor-default" : ""}`} />
          {isEditing && form.email !== (user?.email ?? "") && (
            <p className="text-xs text-warning">
              ⚠️ Ao salvar, um e-mail de confirmação será enviado para o novo endereço.
              Seu e-mail atual continuará sendo usado até a confirmação.
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Bio</Label>
          <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} maxLength={100} disabled={!isEditing} className={`text-sm resize-none ${!isEditing ? "opacity-70 cursor-default" : ""}`} placeholder="Conte um pouco sobre você..." />
          <p className="text-xs text-muted-foreground text-right">{form.bio.length}/100</p>
        </div>

        {/* Birth date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Data de nascimento</Label>
          <Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} disabled={!isEditing} className={`h-10 text-sm ${!isEditing ? "opacity-70 cursor-default" : ""}`} />
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cidade</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} disabled={!isEditing} className={`h-10 text-sm ${!isEditing ? "opacity-70 cursor-default" : ""}`} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado</Label>
            <Select value={form.state} onValueChange={(v) => set("state", v)} disabled={!isEditing}>
              <SelectTrigger className={`h-10 text-sm ${!isEditing ? "opacity-70 cursor-default" : ""}`}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BR.map((e) => (
                  <SelectItem key={e.uf} value={e.uf}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Telefone</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={!isEditing} className={`h-10 text-sm ${!isEditing ? "opacity-70 cursor-default" : ""}`} placeholder="(00) 00000-0000" />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-card">
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Notificações</p>
              <p className="text-xs text-muted-foreground">Receber alertas de cupons e novidades</p>
            </div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        {/* Logout link */}
        <div className="flex justify-center mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Sair da conta</AlertDialogTitle>
                <AlertDialogDescription>Tem certeza que deseja sair?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
