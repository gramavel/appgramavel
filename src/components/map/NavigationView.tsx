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
    // Virar (curva fechada de 90°)
    case "left": return <CornerUpLeft className={cls} />;
    case "right": return <CornerUpRight className={cls} />;
    // Suave (mudança leve de direção)
    case "slight left": return <MoveUpLeft className={cls} />;
    case "slight right": return <MoveUpRight className={cls} />;
    // Curva acentuada
    case "sharp left": return <CornerLeftUp className={cls} />;
    case "sharp right": return <CornerRightUp className={cls} />;
    // Retorno em U
    case "uturn": return <Redo2 className={`${cls} -scale-x-100`} />;
    // Em frente
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
  const mapPaneRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [route, setRoute] = useState<RouteResult | null>(initialRoute);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  // Heading derivado APENAS do movimento real (GPS / deslocamento entre amostras).
  // Bússola do aparelho foi removida porque gira o mapa a qualquer micro-tilt.
  const [heading, setHeading] = useState<number>(0);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastAppliedHeadingRef = useRef<number>(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [distanceToManeuver, setDistanceToManeuver] = useState<number>(0);
  const [remainingM, setRemainingM] = useState<number>(initialRoute ? initialRoute.distanceKm * 1000 : 0);
  const [arrived, setArrived] = useState(false);
  const [muted, setMuted] = useState(false);
  const [recentering, setRecentering] = useState(true);
  const lastSpokenRef = useRef<number>(-1);
  const watchIdRef = useRef<number | null>(null);

  // Encerra navegação imediatamente: cancela voz, watch e dispara onExit
  const exitNow = () => {
    try {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch { /* ignore */ }
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    onExit();
  };

  // Inicializa mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" },
    ).addTo(map);

    // destino
    const destIcon = L.divIcon({
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      html: `<div style="width:32px;height:32px;background:hsl(233,100%,69%);border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);width:10px;height:10px;background:white;border-radius:50%;"></div></div>`,
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);

    map.setView([destination.lat, destination.lng], 17);

    // detectar interação manual do usuário p/ desativar recentering
    map.on("dragstart", () => setRecentering(false));

    mapRef.current = map;

    // Garante que o Leaflet recalcula tiles quando o container muda (ex.: animações de portal)
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    // Invalidação inicial após mount
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [destination.lat, destination.lng]);

  // Desenhar polyline da rota
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }
    const points = route.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngExpression);
    polylineRef.current = L.polyline(points, {
      color: "hsl(233,100%,69%)",
      weight: 6,
      opacity: 0.85,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
  }, [route]);

  // Watch geolocation (alta precisão + posição inicial rápida + filtro de accuracy)
  useEffect(() => {
    if (!navigator.geolocation) return;

    // 1) posição inicial rápida (cache permitido) para já mostrar usuário no mapa
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { /* ignore */ },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 },
    );

    // 2) watch contínuo de alta precisão; descarta amostras com accuracy ruim (>50m)
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy && pos.coords.accuracy > 50) return;
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // Heading: prefere o do GPS; se ausente, calcula a partir do deslocamento
        if (typeof pos.coords.heading === "number" && !isNaN(pos.coords.heading) && pos.coords.heading >= 0) {
          setHeading(pos.coords.heading);
        } else if (lastCoordsRef.current) {
          const prev = lastCoordsRef.current;
          const dLat = next.lat - prev.lat;
          const dLng = next.lng - prev.lng;
          // só atualiza se houve movimento mínimo (~5m) para evitar jitter
          if (Math.hypot(dLat, dLng) > 0.00005) {
            const φ1 = (prev.lat * Math.PI) / 180;
            const φ2 = (next.lat * Math.PI) / 180;
            const Δλ = ((next.lng - prev.lng) * Math.PI) / 180;
            const y = Math.sin(Δλ) * Math.cos(φ2);
            const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
            const brng = (Math.atan2(y, x) * 180) / Math.PI;
            setHeading((brng + 360) % 360);
          }
        }
        lastCoordsRef.current = next;
        setCoords(next);
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

  // Bússola do aparelho (DeviceOrientation) — orienta o mapa mesmo parado
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrientation = (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      // iOS Safari: webkitCompassHeading (já em graus, 0=Norte, sentido horário)
      if (typeof event.webkitCompassHeading === "number" && !isNaN(event.webkitCompassHeading)) {
        setHeadingDevice(event.webkitCompassHeading);
        return;
      }
      // Android/Chrome: alpha (0=Norte quando absolute=true), invertido
      if (event.absolute && typeof event.alpha === "number" && !isNaN(event.alpha)) {
        setHeadingDevice((360 - event.alpha) % 360);
      }
    };

    let added = false;
    const attach = () => {
      window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
      window.addEventListener("deviceorientation", handleOrientation as EventListener, true);
      added = true;
    };

    // iOS 13+ exige permissão explícita
    const DOE = (DeviceOrientationEvent as unknown) as { requestPermission?: () => Promise<"granted" | "denied"> };
    if (typeof DOE.requestPermission === "function") {
      DOE.requestPermission()
        .then((res) => { if (res === "granted") attach(); })
        .catch(() => { /* ignore */ });
    } else {
      attach();
    }

    return () => {
      if (added) {
        window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
        window.removeEventListener("deviceorientation", handleOrientation as EventListener, true);
      }
    };
  }, []);

  // Atualizar marcador do usuário + recentralizar
  // Em modo heading-up, o mapa rotaciona; a seta do usuário fica fixa apontando p/ cima da tela.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords) return;
    const userIcon = L.divIcon({
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:40px;height:40px;background:hsl(233 100% 69% / 0.22);border-radius:50%;animation:nav-pulse 2s ease-out infinite;"></div>
          <div style="position:relative;width:30px;height:30px;border-radius:50%;background:hsl(233,100%,69%);border:3px solid white;box-shadow:0 2px 8px rgba(95,114,255,0.55);display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white" style="transform:translateY(-1px);">
              <path d="M12 2 L19 20 L12 16 L5 20 Z"/>
            </svg>
          </div>
        </div>`,
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: userIcon, zIndexOffset: 1000,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (recentering) {
      map.setView([coords.lat, coords.lng], 18, { animate: true });
    }
  }, [coords, recentering]);

  // Rotação heading-up: gira o pane do mapa para alinhar a direção do usuário com o topo da tela
  useEffect(() => {
    const el = mapPaneRef.current;
    if (!el) return;
    if (recentering) {
      // Contra-rotação: se o usuário aponta para "heading", giramos o mapa em -heading
      el.style.transform = `rotate(${-heading}deg)`;
    } else {
      el.style.transform = "rotate(0deg)";
    }
  }, [heading, recentering]);

  // Recalcular passo atual + distâncias
  useEffect(() => {
    if (!coords || !route || arrived) return;

    // 1) chegou ao destino?
    const distToDest = distanceMeters(coords, destination);
    if (distToDest < 30) {
      setArrived(true);
      setRemainingM(0);
      return;
    }

    // 2) avançar para o próximo passo se estiver perto da próxima manobra
    let idx = stepIdx;
    while (idx < route.steps.length - 1) {
      const next = route.steps[idx + 1];
      const dToNext = distanceMeters(coords, { lat: next.location[0], lng: next.location[1] });
      const dToCurrent = distanceMeters(coords, {
        lat: route.steps[idx].location[0],
        lng: route.steps[idx].location[1],
      });
      // se estamos mais perto do próximo do que do atual, avançamos
      if (dToNext < dToCurrent || dToNext < 25) {
        idx++;
      } else {
        break;
      }
    }
    if (idx !== stepIdx) setStepIdx(idx);

    // 3) distância até a próxima manobra (= alvo do passo atual+1, ou destino)
    const target = route.steps[idx + 1]?.location ?? [destination.lat, destination.lng];
    setDistanceToManeuver(distanceMeters(coords, { lat: target[0], lng: target[1] }));

    // 4) restante: soma das pernas remanescentes a partir do passo atual
    const remaining = route.steps.slice(idx).reduce((acc, s) => acc + s.distanceM, 0);
    setRemainingM(Math.max(remaining, distToDest));

    // 5) recalcular rota se desviou (>60m da polyline aproximado pelo passo atual)
    const dToCurrentStep = distanceMeters(coords, {
      lat: route.steps[idx].location[0], lng: route.steps[idx].location[1],
    });
    const dToNextStep = route.steps[idx + 1]
      ? distanceMeters(coords, {
          lat: route.steps[idx + 1].location[0], lng: route.steps[idx + 1].location[1],
        })
      : Infinity;
    if (Math.min(dToCurrentStep, dToNextStep) > 120) {
      // Desviou — recalcula rota
      getRoute(coords, destination).then((r) => {
        if (r) {
          setRoute(r);
          setStepIdx(0);
        }
      });
    }
  }, [coords, route, stepIdx, arrived, destination]);

  // Voz: anunciar manobra ao trocar de passo
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

  // Voz: anuncia chegada
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

  // ETA simples baseado em ~40km/h média urbana
  const etaMin = remainingM / 1000 / 40 * 60;
  const eta = new Date(Date.now() + etaMin * 60 * 1000);
  const etaLabel = eta.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
      {/* Top: instrução grande */}
      <div className="shrink-0 p-3 pt-[max(env(safe-area-inset-top),0.75rem)] bg-background">
        <div className="bg-primary text-primary-foreground rounded-2xl shadow-lg p-3 flex items-center gap-3">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
            {currentStep ? maneuverIcon(currentStep.maneuver, currentStep.modifier) : <Navigation2 className="w-6 h-6 text-primary-foreground" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold leading-tight">
              {arrived ? "Chegou!" : fmtDistance(distanceToManeuver)}
            </div>
            <div className="text-xs text-primary-foreground/90 truncate">
              {arrived ? destination.name : (nextStep?.instruction ?? currentStep?.instruction ?? "Calculando...")}
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

      {/* Mapa (ocupa o espaço entre header e footer) */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Wrapper rotacionável (heading-up). Maior que a viewport p/ não mostrar borda ao girar. */}
        <div
          ref={mapPaneRef}
          className="absolute"
          style={{
            top: "-50%", left: "-50%", width: "200%", height: "200%",
            transformOrigin: "50% 50%",
            transition: "transform 250ms ease-out",
            willChange: "transform",
          }}
        >
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        {/* Botões flutuantes sobre o mapa */}
        <button
          onClick={() => {
            setMuted((m) => {
              if (!m && "speechSynthesis" in window) window.speechSynthesis.cancel();
              return !m;
            });
          }}
          className="absolute right-3 top-3 z-10 w-11 h-11 rounded-full bg-card shadow-lg flex items-center justify-center border border-border active:scale-95 transition"
          aria-label={muted ? "Ativar voz" : "Silenciar voz"}
        >
          {muted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-primary" />}
        </button>

        {!recentering && coords && (
          <button
            onClick={() => setRecentering(true)}
            className="absolute right-3 bottom-3 z-10 w-11 h-11 rounded-full bg-card shadow-lg flex items-center justify-center border border-border active:scale-95 transition"
            aria-label="Recentralizar no meu local"
          >
            <Navigation2 className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* Bottom: ETA */}
      <div className="shrink-0 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] bg-background border-t border-border">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <div className="text-xl font-bold text-foreground leading-none">
              {arrived ? "0 min" : fmtTime(etaMin)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {fmtDistance(remainingM)} · chegada {etaLabel}
            </div>
          </div>
          <div className="text-right min-w-0 max-w-[60%]">
            <div className="text-[11px] text-muted-foreground">Destino</div>
            <div className="text-sm font-semibold text-foreground truncate">{destination.name}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nav-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
