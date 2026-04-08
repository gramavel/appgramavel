import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink, Loader2, AlertCircle } from "lucide-react";
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : loadingRoute ? (
              <span className="flex items-center gap-1 text-xs">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                Calculando rota...
              </span>
            ) : routeData ? (
              <>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {routeData.distanceKm} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  ~{routeData.durationMin} min de carro
                </span>
              </>
            ) : coords ? (
              <span className="flex items-center gap-1 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                Não foi possível calcular a rota
              </span>
            ) : (
              <span className="text-xs">Ative a localização para ver a rota</span>
            )}
          </div>
        </SheetHeader>

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
