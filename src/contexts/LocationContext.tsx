import React, { createContext, useContext, useEffect, useState } from "react";
import { CITIES } from "@/data/mock";

interface LocationContextType {
  city: string;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({
  city: "Gramado",
  latitude: null,
  longitude: null,
  error: null,
});

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
  const [state, setState] = useState<LocationContextType>({
    city: "Gramado",
    latitude: CITIES.gramado.latitude,
    longitude: CITIES.gramado.longitude,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distGramado = haversine(latitude, longitude, CITIES.gramado.latitude, CITIES.gramado.longitude);
        const distCanela = haversine(latitude, longitude, CITIES.canela.latitude, CITIES.canela.longitude);
        setState({
          city: distGramado <= distCanela ? "Gramado" : "Canela",
          latitude,
          longitude,
          error: null,
        });
      },
      () => {
        setState((s) => ({ ...s, error: "Geolocalização indisponível" }));
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return <LocationContext.Provider value={state}>{children}</LocationContext.Provider>;
}

export const useLocation = () => useContext(LocationContext);
