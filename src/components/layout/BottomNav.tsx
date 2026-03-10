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
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  active && "stroke-[2.5]"
                )}
              />
              <span className="text-xs font-medium">
                {label}
              </span>
            </NavLink>
          );
        })}
          );
        })}
      </div>
    </nav>
  );
}
