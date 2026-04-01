import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Locate } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { MOCK_ESTABLISHMENTS, type Establishment } from "@/data/mock";
import { useNavigate } from "react-router-dom";

// IDs of "visited" establishments (mock)
const VISITED_IDS = new Set(["1", "3"]);

// Read CSS custom properties for consistent theming
function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hslVar(name: string): string {
  const val = getCssVar(name);
  return val ? `hsl(${val})` : "";
}

function createPinIcon(visited: boolean) {
  const bg = visited ? hslVar("--success") : hslVar("--primary");
  const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const inner = visited ? checkSvg : `<div style="width:10px;height:10px;background:white;border-radius:50%;"></div>`;
  const innerTransform = visited ? "transform:rotate(45deg);margin-top:-1px;" : "transform:rotate(45deg);";

  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    html: `
      <div style="
        width:32px;height:32px;
        background:${bg};
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="${innerTransform}display:flex;align-items:center;justify-content:center;">
          ${inner}
        </div>
      </div>
    `,
  });
}

function createUserIcon() {
  const primary = hslVar("--primary");
  return L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;background:${primary}26;border-radius:50%;animation:pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite;"></div>
        <div style="position:absolute;width:32px;height:32px;background:${primary}33;border:1px solid ${primary}4d;border-radius:50%;"></div>
        <div style="position:absolute;width:16px;height:16px;background:${primary};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px ${primary}66;"></div>
      </div>
    `,
  });
}

function createPopupContent(est: Establishment, visited: boolean) {
  const successColor = hslVar("--success");
  const primaryColor = hslVar("--primary");
  const mutedFg = hslVar("--muted-foreground");
  const visitedBadge = visited
    ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;color:${successColor};background:${successColor}1a;padding:2px 6px;border-radius:4px;margin-bottom:6px;">✓ Visitado</span><br/>`
    : "";
  return `
    <div style="min-width:150px;padding:4px;">
      ${visitedBadge}
      <h4 style="font-weight:600;font-size:14px;margin:0 0 2px;">${est.name}</h4>
      <p style="font-size:12px;color:${mutedFg};margin:0 0 8px;">${est.category}</p>
      <a href="/estabelecimento/${est.slug}" style="
        display:block;text-align:center;padding:8px;
        background:${primaryColor};color:white;
        border-radius:8px;font-size:14px;font-weight:500;
        text-decoration:none;
      ">Ver mais</a>
    </div>
  `;
}

interface ExploreMapProps {
  onEstablishmentClick?: (est: Establishment) => void;
}

export default function ExploreMap({ onEstablishmentClick }: ExploreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const { latitude, longitude, requestLocation } = useLocation();
  const navigate = useNavigate();
  const [showSearchArea, setShowSearchArea] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center: L.LatLngExpression = [
      latitude ?? -29.3733,
      longitude ?? -50.8767,
    ];

    const map = L.map(mapRef.current, {
      center,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" }
    ).addTo(map);

    L.control
      .attribution({ position: "bottomright", prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>')
      .addTo(map);

    setTimeout(() => {
      const attr = mapRef.current?.querySelector(".leaflet-control-attribution");
      if (attr instanceof HTMLElement) {
        attr.style.opacity = "0.5";
        attr.style.backdropFilter = "blur(4px)";
        attr.style.background = "rgba(255,255,255,0.6)";
        attr.style.fontSize = "10px";
        attr.style.borderRadius = "4px";
        attr.style.padding = "2px 6px";
      }
    }, 100);

    MOCK_ESTABLISHMENTS.forEach((est) => {
      const visited = VISITED_IDS.has(est.id);
      const marker = L.marker([est.latitude, est.longitude], {
        icon: createPinIcon(visited),
      }).addTo(map);

      marker.bindPopup(createPopupContent(est, visited), {
        closeButton: false,
        className: "custom-popup",
      });

      marker.on("click", () => {
        onEstablishmentClick?.(est);
      });
    });

    map.on("moveend", () => {
      setShowSearchArea(true);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !latitude || !longitude) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      userMarkerRef.current = L.marker([latitude, longitude], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance.current);
    }
  }, [latitude, longitude]);

  const handleLocateMe = useCallback(() => {
    requestLocation();
    if (!mapInstance.current) return;
    const lat = latitude ?? -29.3733;
    const lng = longitude ?? -50.8767;
    mapInstance.current.flyTo([lat, lng], 17, { duration: 0.8 });
  }, [latitude, longitude, requestLocation]);

  const handleSearchArea = useCallback(() => {
    setShowSearchArea(false);
  }, []);

  return (
    <div className="relative h-[45vh] min-h-[350px] rounded-xl border border-border shadow-card overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {showSearchArea && (
        <button
          onClick={handleSearchArea}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full shadow-lg text-sm font-medium text-foreground hover:shadow-xl transition-shadow"
        >
          <Search className="w-4 h-4 text-primary" />
          Buscar nesta área
        </button>
      )}

      <button
        onClick={handleLocateMe}
        aria-label="Minha localização"
        className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-12 h-12 bg-card/90 backdrop-blur-sm rounded-full shadow-card hover:bg-card transition-colors"
      >
        <Locate className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
