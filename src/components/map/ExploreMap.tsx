import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Locate } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { MOCK_ESTABLISHMENTS, type Establishment } from "@/data/mock";
import { useNavigate } from "react-router-dom";

const VISITED_IDS = new Set(["1", "3"]);

function createPinIcon(visited: boolean) {
  const bg = visited ? "#22c55e" : "hsl(233, 100%, 69%)";
  const inner = visited
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<circle cx="5" cy="5" r="5" fill="white"/>`;
  const innerTransform = visited ? 'transform:rotate(45deg);margin-top:-1px;' : 'transform:rotate(45deg);';

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
          ${visited ? inner : '<div style="width:10px;height:10px;background:white;border-radius:50%;"></div>'}
        </div>
      </div>
    `,
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;background:hsl(233 100% 69% / 0.15);border-radius:50%;animation:pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite;"></div>
        <div style="position:absolute;width:32px;height:32px;background:hsl(233 100% 69% / 0.2);border:1px solid hsl(233 100% 69% / 0.3);border-radius:50%;"></div>
        <div style="position:absolute;width:16px;height:16px;background:hsl(233 100% 69%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(95,114,255,0.4);"></div>
      </div>
    `,
  });
}

function createPopupContent(est: Establishment, visited: boolean) {
  const visitedBadge = visited
    ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;color:#16a34a;background:rgba(34,197,94,0.1);padding:2px 6px;border-radius:4px;margin-bottom:6px;">✓ Visitado</span><br/>`
    : "";
  return `
    <div style="min-width:150px;padding:4px;">
      ${visitedBadge}
      <h4 style="font-weight:600;font-size:14px;margin:0 0 2px;">${est.name}</h4>
      <p style="font-size:12px;color:hsl(215 16% 47%);margin:0 0 8px;">${est.category}</p>
      <a href="/estabelecimento/${est.slug}" style="
        display:block;text-align:center;padding:8px;
        background:hsl(233 100% 69%);color:white;
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
  const { coords } = useLocation();
  const navigate = useNavigate();
  const [showSearchArea, setShowSearchArea] = useState(false);

  const lat = coords?.lat ?? -29.3733;
  const lng = coords?.lng ?? -50.8767;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center: L.LatLngExpression = [lat, lng];

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
    if (!mapInstance.current || !coords) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      userMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance.current);
    }
  }, [coords]);

  const handleLocateMe = useCallback(() => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo([lat, lng], 17, { duration: 0.8 });
  }, [lat, lng]);

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
        className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
      >
        <Locate className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
