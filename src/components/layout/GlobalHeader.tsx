import { useState } from "react";
import { ChevronLeft, Bell, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { Badge } from "@/components/ui/badge";
import logoSrc from "@/assets/logo_gramavel_header.svg";
import { NotificationsSheet } from "./NotificationsSheet";

interface GlobalHeaderProps {
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
}

export function GlobalHeader({ showBack, title = "Gramável", onBack }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const { city } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left */}
          <div className="w-24 flex items-center">
            {showBack ? (
              <button onClick={() => onBack ? onBack() : navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-secondary transition-colors active:scale-95">
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                {city}
              </Badge>
            )}
          </div>

          {/* Center */}
          <img src={logoSrc} alt="Gramável" className="h-[18px]" />

          {/* Right */}
          <div className="w-24 flex justify-end">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors active:scale-95"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      <NotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}
