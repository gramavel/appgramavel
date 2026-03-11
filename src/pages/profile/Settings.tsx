import { useState } from "react";
import { Camera, Save, LogOut, Bell } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState("João da Silva");
  const [bio, setBio] = useState("Apaixonado pela Serra Gaúcha 🏔️");
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack title="Configurações" />
      <main className="max-w-2xl mx-auto px-4 pb-20 pt-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-border">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer">
              <Camera className="w-4 h-4" />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Toque para alterar a foto</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bio</Label>
            <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value.slice(0, 100))} />
            <p className="text-xs text-muted-foreground">{bio.length}/100 caracteres</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Notificações</p>
              <p className="text-xs text-muted-foreground">Receber alertas de cupons e novidades</p>
            </div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        {/* Buttons */}
        <Button className="w-full gap-2">
          <Save className="w-4 h-4" />
          Salvar alterações
        </Button>
        <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Sair da conta
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
