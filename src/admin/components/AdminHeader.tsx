import { useLocation } from "react-router-dom";

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
  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const title = TITLES[basePath] || "Admin";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </header>
  );
}
