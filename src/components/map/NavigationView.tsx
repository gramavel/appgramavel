import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map-styles.css";
import {
  ArrowUp, MoveUpLeft, MoveUpRight, CornerUpLeft, CornerUpRight,
  CornerLeftUp, CornerRightUp, Redo2, RotateCw, Flag, Navigation2,
  Volume2, VolumeX,
} from "lucide-react";
import { CloseButton } from "@/components/ui/CloseButton";
import {
  getRoute, distanceMeters, type RouteResult, type RouteStep,
} from "@/lib/routing";

interface NavigationViewProps {
  destination: { lat: number; lng: number; name: string };
  initialRoute: RouteResult | null;
  onExit: () => void;
}

function maneuverIcon(maneuver: string, modifier?: string) {
  const cls = "w-7 h-7 text-primary-foreground";
  if (maneuver === "arrive") return <Flag className={cls} />;
  if (maneuver === "depart") return <Navigation2 className={cls} />;
  if (maneuver === "roundabout" || maneuver === "rotary") return <RotateCw className={cls} />;
  switch (modifier) {
    case "left": return <CornerUpLeft className={cls} />;
    case "right": return <CornerUpRight className={cls} />;
    case "slight left": return <MoveUpLeft className={cls} />;
    case "slight right": return <MoveUpRight className={cls} />;
    case "sharp left": return <CornerLeftUp className={cls} />;
    case "sharp right": return <CornerRightUp className={cls} />;
    case "uturn": return <Redo2 className={`${cls} -scale-x-100`} />;
    default: return <ArrowUp className={cls} />;
  }
}

function fmtDistance(m: number) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function fmtTime(min: number) {
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function NavigationView({ destination, initialRoute, onExit }: NavigationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [route, setRoute] = useState<RouteResult | null>(initialRoute);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [distanceToManeuver, setDistanceToManeuver] = useState<number>(0);
  const [remainingM, setRemainingM] = useState<number>(initialRoute ? initialRoute.distanceKm * 1000 : 0);
  const [arrived, setArrived] = useState(false);
  const [muted, setMuted] = useState(false);
  const [recentering, setRecentering] = useState(true);
  const lastSpokenRef = useRef<number>(-1);
  const watchIdRef = useRef<number | null>(null);

  const exitNow = () => {
    try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch { /* ignore */ }
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    onExit();
  };

  // Inicializa mapa — tiles claros (CartoDB Voyager) alinhados à identidade do app
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      zoomSnap: 0.25,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 20, subdomains: "abcd" },
    ).addTo(map);

    // Pin destino — gradiente do brand, sem glow neon
    const destIcon = L.divIcon({
      className: "",
      iconSize: [36, 46],
      iconAnchor: [18, 44],
      html: `
        <div style="position:relative;width:36px;height:46px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.25));">
          <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:34px;height:34px;border-radius:50% 50% 50% 0;transform-origin:center;transform:translateX(-50%) rotate(-45deg);background:linear-gradient(135deg,hsl(233,100%,69%),hsl(236,100%,79%));border:2px solid white;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg);"><path d="M4 22V4a1 1 0 0 1 1-1h13l-3 5 3 5H5"/></svg>
          </div>
        </div>`,
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);

    map.setView([destination.lat, destination.lng], 18);
    map.on("dragstart", () => setRecentering(false));

    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [destination.lat, destination.lng]);

  // Polyline da rota — limpa, sem glow neon
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    const points = route.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngExpression);
    const casing = L.polyline(points, {
      color: "#ffffff",
      weight: 10,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    const line = L.polyline(points, {
      color: "hsl(233,100%,69%)",
      weight: 6,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    polylineRef.current = L.layerGroup([casing, line]) as unknown as L.Polyline;
  }, [route]);

  // Watch geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { /* ignore */ },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 },
    );
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy && pos.coords.accuracy > 50) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.warn("watchPosition error", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
    watchIdRef.current = id;
    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, []);

  // Marcador do usuário + recentralizar com offset (câmera estilo Google Maps)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords) return;
    const userIcon = L.divIcon({
      className: "",
      iconSize: [56, 56],
      iconAnchor: [28, 28],
      html: `
        <div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:48px;height:48px;background:hsl(233 100% 69% / 0.22);border-radius:50%;animation:nav-pulse 2.2s ease-out infinite;"></div>
          <div style="position:relative;width:20px;height:20px;border-radius:50%;background:hsl(233,100%,69%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>
        </div>`,
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: userIcon, zIndexOffset: 1000, interactive: false,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (recentering) {
      // Câmera "à frente": empurra o usuário para a parte inferior da tela
      const targetZoom = 18;
      const point = map.project([coords.lat, coords.lng], targetZoom);
      const yOffset = map.getSize().y * 0.22;
      const adjusted = map.unproject(point.add([0, -yOffset]), targetZoom);
      map.setView(adjusted, targetZoom, { animate: true });
    }
  }, [coords, recentering]);

  // Recalcular passo + distâncias
  useEffect(() => {
    if (!coords || !route || arrived) return;
    const distToDest = distanceMeters(coords, destination);
    if (distToDest < 30) {
      setArrived(true);
      setRemainingM(0);
      return;
    }
    let idx = stepIdx;
    while (idx < route.steps.length - 1) {
      const next = route.steps[idx + 1];
      const dToNext = distanceMeters(coords, { lat: next.location[0], lng: next.location[1] });
      const dToCurrent = distanceMeters(coords, {
        lat: route.steps[idx].location[0], lng: route.steps[idx].location[1],
      });
      if (dToNext < dToCurrent || dToNext < 25) idx++;
      else break;
    }
    if (idx !== stepIdx) setStepIdx(idx);

    const target = route.steps[idx + 1]?.location ?? [destination.lat, destination.lng];
    setDistanceToManeuver(distanceMeters(coords, { lat: target[0], lng: target[1] }));

    const remaining = route.steps.slice(idx).reduce((acc, s) => acc + s.distanceM, 0);
    setRemainingM(Math.max(remaining, distToDest));

    const dToCurrentStep = distanceMeters(coords, {
      lat: route.steps[idx].location[0], lng: route.steps[idx].location[1],
    });
    const dToNextStep = route.steps[idx + 1]
      ? distanceMeters(coords, {
          lat: route.steps[idx + 1].location[0], lng: route.steps[idx + 1].location[1],
        })
      : Infinity;
    if (Math.min(dToCurrentStep, dToNextStep) > 120) {
      getRoute(coords, destination).then((r) => {
        if (r) { setRoute(r); setStepIdx(0); }
      });
    }
  }, [coords, route, stepIdx, arrived, destination]);

  // Voz: anunciar manobra
  useEffect(() => {
    if (muted || arrived) return;
    if (!route || stepIdx === lastSpokenRef.current) return;
    if (!("speechSynthesis" in window)) return;
    lastSpokenRef.current = stepIdx;
    const step = route.steps[stepIdx];
    if (!step) return;
    try {
      const u = new SpeechSynthesisUtterance(step.instruction);
      u.lang = "pt-BR";
      u.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }, [stepIdx, route, muted, arrived]);

  useEffect(() => {
    if (arrived && !muted && "speechSynthesis" in window) {
      try {
        const u = new SpeechSynthesisUtterance("Você chegou ao destino.");
        u.lang = "pt-BR";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch { /* ignore */ }
    }
  }, [arrived, muted]);

  const currentStep: RouteStep | undefined = route?.steps[stepIdx];
  const nextStep: RouteStep | undefined = route?.steps[stepIdx + 1];

  const etaMin = remainingM / 1000 / 40 * 60;
  const eta = new Date(Date.now() + etaMin * 60 * 1000);
  const etaLabel = eta.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
      {/* Mapa em vista padrão (top-down), sem perspectiva 3D */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Card de instrução flutuante no topo */}
      <div className="relative z-10 shrink-0 px-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <div className="bg-primary text-primary-foreground rounded-2xl shadow-lg p-3 flex items-center gap-3">
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            {currentStep ? maneuverIcon(currentStep.maneuver, currentStep.modifier) : <Navigation2 className="w-6 h-6 text-primary-foreground" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-extrabold leading-none tracking-tight">
              {arrived ? "Chegou!" : fmtDistance(distanceToManeuver)}
            </div>
            <div className="text-[13px] text-primary-foreground/95 truncate mt-1">
              {arrived ? destination.name : (nextStep?.instruction ?? currentStep?.instruction ?? "Calculando rota…")}
            </div>
          </div>
          <CloseButton
            variant="overlay"
            size="md"
            label="Encerrar navegação"
            onClick={exitNow}
            className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground shrink-0"
          />
        </div>
      </div>

      {/* Botões flutuantes laterais */}
      <div className="relative z-10 flex-1 min-h-0 pointer-events-none">
        <button
          onClick={() => {
            setMuted((m) => {
              if (!m && "speechSynthesis" in window) window.speechSynthesis.cancel();
              return !m;
            });
          }}
          className="pointer-events-auto absolute right-3 top-3 w-11 h-11 rounded-full bg-card/95 backdrop-blur shadow-lg flex items-center justify-center border border-border/60 active:scale-95 transition"
          aria-label={muted ? "Ativar voz" : "Silenciar voz"}
        >
          {muted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-primary" />}
        </button>

        {!recentering && coords && (
          <button
            onClick={() => setRecentering(true)}
            className="pointer-events-auto absolute right-3 bottom-3 w-11 h-11 rounded-full bg-card/95 backdrop-blur shadow-lg flex items-center justify-center border border-border/60 active:scale-95 transition"
            aria-label="Recentralizar no meu local"
          >
            <Navigation2 className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* Card de ETA flutuante no rodapé */}
      <div className="relative z-10 shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-lg p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold text-foreground leading-none tracking-tight">
              {arrived ? "0 min" : fmtTime(etaMin)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5">
              {fmtDistance(remainingM)} · chegada {etaLabel}
            </div>
          </div>
          <div className="text-right min-w-0 max-w-[60%]">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Destino</div>
            <div className="text-sm font-semibold text-foreground truncate mt-1">{destination.name}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nav-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
}
