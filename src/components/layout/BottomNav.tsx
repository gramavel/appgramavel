import { Home, Map, Route, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/map", icon: Map, label: "Explorar" },
  { to: "/roteiros", icon: Route, label: "Roteiros" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" aria-label="Navegação principal">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-4">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary-rgb),0.3)]" />
              )}
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300",
                active && "bg-primary/5 scale-110"
              )}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    active ? "stroke-[2.5]" : "stroke-[2]"
                  )}
                />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 tracking-tight transition-all duration-300",
                active ? "font-bold" : "font-medium"
              )}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
