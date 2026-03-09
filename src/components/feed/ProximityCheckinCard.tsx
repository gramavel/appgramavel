import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProximityCheckinCardProps {
  name: string;
  distance: number;
  onCheckin: () => void;
}

export function ProximityCheckinCard({ name, distance, onCheckin }: ProximityCheckinCardProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-2xl border border-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary">Você está perto!</p>
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`} de distância</p>
        </div>
        <Button size="sm" onClick={onCheckin}>
          Check-in
        </Button>
      </div>
    </div>
  );
}
