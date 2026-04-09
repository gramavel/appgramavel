import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink, Loader2, AlertCircle, Car, Bike } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/contexts/LocationContext";
import RouteMap from "./RouteMap";
import type { RouteResult } from "@/lib/routing";

interface MapSheetProps {
  open: boolean;
  onClose: () => void;
  establishment: {
    name: string;
    latitude: number | null;
    longitude: number | null;
    distance_km?: number | null;
  };
}

function WalkingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1.5" />
      <path d="M13.5 8.5L15 12l-3 3-1 5" />
      <path d="M10.5 8.5L9 12l1.5 3" />
    </svg>
  );
}

function MotorcycleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="16" r="3" />
      <circle cx="19" cy="16" r="3" />
      <path d="M7.5 14L12 6l2 4h4" />
      <path d="M12 10l-4.5 4" />
    </svg>
  );
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

// Speed multipliers relative to car
const TRANSPORT_MODES = [
  { key: "car", label: "Carro", icon: Car, factor: 1 },
  { key: "moto", label: "Moto", icon: MotorcycleIcon, factor: 0.85 },
  { key: "bike", label: "Bicicleta", icon: Bike, factor: 4 },
  { key: "walk", label: "A pé", icon: WalkingIcon, factor: 6 },
] as const;

export default function MapSheet({ open, onClose, establishment }: MapSheetProps) {
  const { coords, loading } = useLocation();
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  const destLat = establishment.latitude ?? -29.3789;
  const destLng = establishment.longitude ?? -50.8732;

  const handleRouteCalculated = (result: RouteResult | null) => {
    setRouteData(result);
    setLoadingRoute(false);
  };

  const handleOpenExternal = () => {
    const q = `${destLat},${destLng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2 space-y-1">
          <SheetTitle className="text-lg font-bold text-foreground">
            {establishment.name}
          </SheetTitle>
        </SheetHeader>

        {/* Transport mode chips */}
        <div className="px-4 pb-3">
          {loading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          ) : loadingRoute ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              Calculando rota...
            </div>
          ) : routeData ? (
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-2 pb-1">
                {/* Distance chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium whitespace-nowrap shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                  {routeData.distanceKm} km
                </div>
                {/* Time per transport mode */}
                {TRANSPORT_MODES.map(({ key, label, icon: Icon, factor }) => {
                  const min = Math.ceil(routeData.durationMin * factor);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-primary/30 text-foreground text-[13px] font-medium whitespace-nowrap shrink-0"
                    >
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      {formatDuration(min)}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : coords ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5" />
              Não foi possível calcular a rota
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Ative a localização para ver a rota</span>
          )}
        </div>

        {/* Map area */}
        <div className="flex-1 min-h-0">
          <RouteMap
            user={coords}
            destination={{ lat: destLat, lng: destLng }}
            onRouteCalculated={handleRouteCalculated}
          />
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button className="w-full rounded-full" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground gap-1"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="w-3 h-3" />
            Abrir no Google Maps
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
