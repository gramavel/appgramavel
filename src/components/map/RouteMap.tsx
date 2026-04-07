import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map-styles.css";

interface RouteMapProps {
  user: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number };
  /** Future: swap polyline for real route geometry from OSRM/Mapbox */
  routeGeometry?: [number, number][];
}

function createDestinationIcon() {
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    html: `
      <div style="
        width:32px;height:32px;
        background:hsl(233,100%,69%);
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="transform:rotate(45deg);width:10px;height:10px;background:white;border-radius:50%;"></div>
      </div>
    `,
  });
}

function createUserDot() {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:24px;height:24px;background:hsl(233 100% 69% / 0.2);border-radius:50%;"></div>
        <div style="position:absolute;width:12px;height:12px;background:hsl(233,100%,69%);border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(95,114,255,0.4);"></div>
      </div>
    `,
  });
}

export default function RouteMap({ user, destination, routeGeometry }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" }
    ).addTo(map);

    // Destination marker
    L.marker([destination.lat, destination.lng], { icon: createDestinationIcon() }).addTo(map);

    if (user) {
      // User marker
      L.marker([user.lat, user.lng], { icon: createUserDot(), zIndexOffset: 1000 }).addTo(map);

      // Route line (straight or real geometry)
      const points: L.LatLngExpression[] = routeGeometry
        ? routeGeometry.map(([lat, lng]) => [lat, lng] as L.LatLngExpression)
        : [[user.lat, user.lng], [destination.lat, destination.lng]];

      L.polyline(points, {
        color: "hsl(233,100%,69%)",
        weight: 4,
        opacity: 0.7,
        dashArray: "8 8",
      }).addTo(map);

      // Fit both points
      const bounds = L.latLngBounds(
        [user.lat, user.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      map.setView([destination.lat, destination.lng], 15);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
