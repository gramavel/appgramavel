import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CITIES } from "@/data/mock";

interface LocationContextType {
  coords: { lat: number; lng: number } | null;
  loading: boolean;
  hasLocation: boolean;
  city: string;
  getDistance: (lat: number, lng: number) => string | null;
}

const LocationContext = createContext<LocationContextType | null>(null);

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (e) => {
        console.warn("Geolocation failed, using mock distances", e);
        setLoading(false);
      },
      { timeout: 5000 }
    );
  }, []);

  const getDistance = useCallback(
    (lat: number, lng: number): string | null => {
      if (!coords) return null;
      const d = haversine(coords.lat, coords.lng, lat, lng);
      return `${d.toFixed(1)} km`;
    },
    [coords]
  );

  const city = coords
    ? haversine(coords.lat, coords.lng, CITIES.gramado.latitude, CITIES.gramado.longitude) <=
      haversine(coords.lat, coords.lng, CITIES.canela.latitude, CITIES.canela.longitude)
      ? "Gramado"
      : "Canela"
    : "Gramado";

  return (
    <LocationContext.Provider value={{ coords, loading, hasLocation: !!coords, city, getDistance }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
