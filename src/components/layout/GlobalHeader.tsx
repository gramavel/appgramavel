import { ChevronLeft, Bell, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { Badge } from "@/components/ui/badge";

interface GlobalHeaderProps {
  showBack?: boolean;
  title?: string;
}

export function GlobalHeader({ showBack, title = "Gramável" }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const { city } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="w-24 flex items-center">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-secondary transition-colors">
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
        <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">{title}</span>

        {/* Right */}
        <div className="w-24 flex justify-end">
          {!showBack && (
            <div className="relative p-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
