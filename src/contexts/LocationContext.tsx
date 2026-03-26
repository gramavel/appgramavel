import React, { createContext, useContext, useState, useCallback } from "react";
import { CITIES } from "@/data/mock";

interface LocationContextType {
  city: string;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  requestLocation: () => void;
  locationRequested: boolean;
}

const LocationContext = createContext<LocationContextType>({
  city: "Gramado",
  latitude: null,
  longitude: null,
  error: null,
  requestLocation: () => {},
  locationRequested: false,
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
  const [state, setState] = useState({
    city: "Gramado",
    latitude: CITIES.gramado.latitude as number | null,
    longitude: CITIES.gramado.longitude as number | null,
    error: null as string | null,
  });
  const [locationRequested, setLocationRequested] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const requestLocation = useCallback(() => {
    if (locationRequested || !navigator.geolocation) return;
    setLocationRequested(true);

    const id = navigator.geolocation.watchPosition(
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
    setWatchId(id);
  }, [locationRequested]);

  return (
    <LocationContext.Provider value={{ ...state, requestLocation, locationRequested }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
