import { useState } from "react";
import { Camera, Save, LogOut, Bell } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState("Ana Silva");
  const [bio, setBio] = useState("Explorando a Serra Gaúcha ✨");
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
            <img src="https://i.pravatar.cc/200?img=5" alt="" className="w-24 h-24 rounded-full border-4 border-border object-cover" />
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary shadow-lg flex items-center justify-center cursor-pointer">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value.slice(0, 100))} />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/100</p>
        </div>

        <Card className="rounded-xl">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-muted-foreground">Receber alertas de novos cupons</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </CardContent>
        </Card>

        <Button className="w-full"><Save className="w-4 h-4 mr-2" /> Salvar alterações</Button>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Sair da conta
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
