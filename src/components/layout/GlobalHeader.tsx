import { ChevronLeft, Bell, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";

interface GlobalHeaderProps {
  showBack?: boolean;
  title?: string;
}

export function GlobalHeader({ showBack, title = "Gramável" }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const { city } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left */}
        <div className="w-24 flex items-center">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-secondary transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{city}</span>
            </div>
          )}
        </div>

        {/* Center */}
        <h1 className="text-xl font-bold text-gradient-primary">{title}</h1>

        {/* Right */}
        <div className="w-24 flex justify-end">
          {!showBack && (
            <button className="p-2 rounded-full hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
