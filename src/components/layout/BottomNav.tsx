import { Home, Map, Ticket, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/map", icon: Map, label: "Explorar" },
  { to: "/coupons", icon: Ticket, label: "Cupons" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-14">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 py-1 px-3"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-primary stroke-[2.5]" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  active ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
