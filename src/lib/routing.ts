export interface RouteStep {
  instruction: string;
  distanceM: number;
  durationS: number;
  maneuver: string; // turn, new name, depart, arrive, etc
  modifier?: string; // left, right, straight, slight left, sharp right, etc
  location: [number, number]; // [lat, lng] do início da manobra
  name?: string; // rua
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng][]
  distanceKm: number;
  durationMin: {
    car: number;
    moto: number;
    bike: number;
    walking: number;
  };
  steps: RouteStep[];
}

const SPEEDS = {
  car: 50,
  moto: 45,
  bike: 15,
  walking: 5,
};

const MANEUVER_PT: Record<string, string> = {
  "turn-left": "Vire à esquerda",
  "turn-right": "Vire à direita",
  "turn-slight left": "Mantenha-se à esquerda",
  "turn-slight right": "Mantenha-se à direita",
  "turn-sharp left": "Curva acentuada à esquerda",
  "turn-sharp right": "Curva acentuada à direita",
  "turn-straight": "Siga em frente",
  "turn-uturn": "Faça o retorno",
  "new name-straight": "Continue em frente",
  "depart-": "Inicie a rota",
  "arrive-": "Você chegou ao destino",
  "roundabout-": "Entre na rotatória",
  "rotary-": "Entre na rotatória",
  "merge-": "Faça a confluência",
  "fork-left": "Mantenha-se à esquerda na bifurcação",
  "fork-right": "Mantenha-se à direita na bifurcação",
  "end of road-left": "Vire à esquerda no fim da via",
  "end of road-right": "Vire à direita no fim da via",
  "continue-straight": "Continue em frente",
};

function translateManeuver(type: string, modifier?: string, name?: string): string {
  const key = `${type}-${modifier ?? ""}`;
  let base = MANEUVER_PT[key] ?? MANEUVER_PT[`${type}-`] ?? "Continue";
  if (name && type !== "arrive" && type !== "depart") {
    base += ` em ${name}`;
  } else if (name && type === "depart") {
    base = `Siga por ${name}`;
  }
  return base;
}

export async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteResult | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );

    const distKm = parseFloat((route.distance / 1000).toFixed(1));

    const steps: RouteStep[] = [];
    for (const leg of route.legs ?? []) {
      for (const s of leg.steps ?? []) {
        const [lng, lat] = s.maneuver.location;
        steps.push({
          instruction: translateManeuver(s.maneuver.type, s.maneuver.modifier, s.name),
          distanceM: Math.round(s.distance),
          durationS: Math.round(s.duration),
          maneuver: s.maneuver.type,
          modifier: s.maneuver.modifier,
          location: [lat, lng],
          name: s.name,
        });
      }
    }

    return {
      coordinates,
      distanceKm: distKm,
      durationMin: {
        car: Math.ceil((distKm / SPEEDS.car) * 60),
        moto: Math.ceil((distKm / SPEEDS.moto) * 60),
        bike: Math.ceil((distKm / SPEEDS.bike) * 60),
        walking: Math.ceil((distKm / SPEEDS.walking) * 60),
      },
      steps,
    };
  } catch {
    return null;
  }
}

// Distância em metros entre dois pontos (Haversine)
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
