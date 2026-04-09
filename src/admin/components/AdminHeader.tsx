import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/estabelecimentos": "Estabelecimentos",
  "/admin/usuarios": "Usuários",
  "/admin/feed": "Feed",
  "/admin/explorar": "Explorar",
  "/admin/roteiros": "Roteiros",
  "/admin/notificacoes": "Notificações",
  "/admin/cupons": "Cupons",
};

export function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const title = TITLES[basePath] || "Admin";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </header>
  );
}
