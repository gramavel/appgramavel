import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import logoSrc from "@/assets/logo_gramavel_header.svg";
import { NotificationsSheet } from "./NotificationsSheet";
import { getUnreadCount } from "@/services/notifications";

interface GlobalHeaderProps {
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
}

export function GlobalHeader({ showBack, title = "Gramável", onBack }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const { city } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(({ data }) => setUnreadCount(data ?? 0));
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between h-16">
          {/* Left: Back or Location */}
          <div className="flex-1 flex items-center">
            {showBack ? (
              <button
                onClick={() => onBack ? onBack() : navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-secondary/80 transition-all active:scale-90 flex items-center justify-center group"
                aria-label="Voltar"
              >
                <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
              </button>
            ) : (
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors active:scale-95 border border-border/20 shadow-sm"
                onClick={() => navigate("/map")}
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground tracking-tight">{city}</span>
              </button>
            )}
          </div>

          {/* Center: Logo or Title */}
          <div className="flex-[2] flex justify-center">
            {title && title !== "Gramável" ? (
              <h1 className="text-sm font-bold text-foreground tracking-tight truncate max-w-[150px]">
                {title}
              </h1>
            ) : (
              <img 
                src={logoSrc} 
                alt="Gramável" 
                className="h-5 w-auto object-contain active:scale-95 transition-transform cursor-pointer" 
                onClick={() => navigate("/")}
              />
            )}
          </div>

          {/* Right: Notifications */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-full hover:bg-secondary/80 transition-all active:scale-90 flex items-center justify-center group"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse shadow-sm" />
              )}
            </button>
          </div>
        </div>
      </header>

      <NotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}
