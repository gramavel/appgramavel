import { useState, useRef, useEffect } from "react";
import { Camera, Save, LogOut, Bell } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile, signOut } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    bio: "",
    birth_date: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        bio: profile.bio ?? "",
        birth_date: profile.birth_date ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const displayName = profile?.name || user?.email?.split("@")[0] || "Usuário";
  const avatarUrl = avatarPreview || profile?.avatar_url || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar foto");
      setAvatarPreview(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(path);

    await supabase
      .from("user_profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    await refreshProfile();
    toast.success("Foto atualizada!");
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({
        name: form.name,
        city: form.city,
        state: form.state,
        bio: form.bio,
        birth_date: form.birth_date || null,
        phone: form.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error) {
      await refreshProfile();
      toast.success("Perfil atualizado!");
    } else {
      toast.error("Erro ao salvar");
    }
    setSaving(false);
  }

  const handleLogout = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Configurações" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-20 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <Avatar className="w-24 h-24 border-4 border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Toque para alterar a foto</p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Nome</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10 text-sm" />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Bio</Label>
          <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} maxLength={100} className="text-sm resize-none" placeholder="Conte um pouco sobre você..." />
          <p className="text-xs text-muted-foreground text-right">{form.bio.length}/100</p>
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cidade</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-10 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado</Label>
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} className="h-10 text-sm" />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Telefone</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-10 text-sm" placeholder="(00) 00000-0000" />
        </div>

        {/* Birth date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Data de nascimento</Label>
          <Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} className="h-10 text-sm" />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Notificações</p>
              <p className="text-xs text-muted-foreground">Receber alertas de cupons e novidades</p>
            </div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        {/* Save button */}
        <Button className="w-full gap-2 rounded-full" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>

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
