import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Navigation, CheckCircle2, SkipForward, PartyPopper } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MOCK_ROUTES, MOCK_ESTABLISHMENTS } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

export default function RoteiroNavigation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const route = MOCK_ROUTES.find(r => r.id === id);

  const [currentStop, setCurrentStop] = useState(0);
  const [visited, setVisited] = useState<boolean[]>(() => new Array(route?.stops.length || 0).fill(false));
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);

  if (!route) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Roteiro não encontrado</p>
      </div>
    );
  }

  const getEstablishmentForStop = (stopName: string) => {
    return MOCK_ESTABLISHMENTS.find(e => e.name === stopName);
  };

  const advanceStop = (markVisited: boolean) => {
    const newVisited = [...visited];
    if (markVisited) newVisited[currentStop] = true;
    setVisited(newVisited);

    const nextStop = currentStop + 1;
    if (nextStop >= route.stops.length) {
      setShowConclusion(true);
    } else {
      setCurrentStop(nextStop);
    }
  };

  const finishRoute = () => {
    toast.success("Roteiro concluído! 🎉");
    navigate("/roteiros");
  };

  const exitRoute = () => {
    setShowExitDialog(false);
    navigate(`/roteiros/${route.id}`);
  };

  // Conclusion screen
  if (showConclusion) {
    const visitedCount = visited.filter(Boolean).length;
    const skippedCount = visited.filter(v => !v).length;
    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader showBack onBack={finishRoute} />
        <main className="max-w-2xl mx-auto px-4 pb-20 pt-14 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-4 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <PartyPopper className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Roteiro concluído!</h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Você completou o roteiro <span className="font-semibold text-foreground">"{route.title}"</span>
            </p>
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{visitedCount}</p>
                <p className="text-xs text-muted-foreground">Visitados</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{skippedCount}</p>
                <p className="text-xs text-muted-foreground">Pulados</p>
              </div>
            </div>
            <div className="pt-4 space-y-2 w-full max-w-xs mx-auto">
              {route.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    visited[i] ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    {visited[i] ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-sm",
                    visited[i] ? "text-foreground" : "text-muted-foreground line-through"
                  )}>{stop.name}</span>
                </div>
              ))}
            </div>
            <Button className="w-full rounded-full mt-6" onClick={finishRoute}>
              Voltar aos roteiros
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Active navigation
  const stop = route.stops[currentStop];
  const est = getEstablishmentForStop(stop.name);
  const isLast = currentStop === route.stops.length - 1;
  const nextStop = !isLast ? route.stops[currentStop + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader showBack onBack={() => setShowExitDialog(true)} />

      <main className="max-w-2xl mx-auto pb-20 pt-14">
        {/* Hero image */}
        <div className="relative aspect-[4/5] overflow-hidden animate-fade-in-up">
          <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
              Parada {currentStop + 1} de {route.stops.length}
            </Badge>
            <h2 className="text-white font-bold text-xl">{stop.name}</h2>
            <p className="text-white/70 text-sm">{stop.category}</p>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1">
            {route.stops.map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  i < currentStop
                    ? visited[i] ? "bg-green-500" : "bg-muted-foreground/40"
                    : i === currentStop
                      ? "bg-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                      : "bg-muted"
                )} />
                {i < route.stops.length - 1 && (
                  <div className={cn(
                    "w-4 h-0.5 rounded-full transition-all duration-300",
                    i < currentStop ? "bg-primary/50" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Info card */}
          <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{est?.address || "Gramado, RS"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{est?.rating || 4.5} · {est?.category || stop.category}</span>
            </div>
            {est && (
              <Button
                variant="outline"
                className="w-full rounded-full gap-2 text-sm"
                onClick={() => {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${est.latitude},${est.longitude}`, "_blank");
                }}
              >
                <Navigation className="w-4 h-4" />
                Como chegar
              </Button>
            )}
          </div>

          {/* Next stop preview */}
          {nextStop && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <img src={nextStop.image} alt={nextStop.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">A seguir</p>
                <p className="text-sm font-medium text-foreground truncate">{nextStop.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          {/* Action buttons */}
          {isLast ? (
            <Button className="w-full rounded-full gap-2" onClick={() => advanceStop(true)}>
              <CheckCircle2 className="w-4 h-4" />
              Concluir roteiro 🎉
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full gap-2" onClick={() => advanceStop(false)}>
                <SkipForward className="w-4 h-4" />
                Pular
              </Button>
              <Button className="flex-1 rounded-full gap-2" onClick={() => advanceStop(true)}>
                <CheckCircle2 className="w-4 h-4" />
                Já visitei
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="rounded-2xl max-w-xs mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do roteiro?</AlertDialogTitle>
            <AlertDialogDescription>
              Seu progresso será perdido. Tem certeza que deseja sair?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Continuar</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={exitRoute}>
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
