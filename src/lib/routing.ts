export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng][]
  distanceKm: number;
  durationMin: {
    car: number;
    moto: number;
    bike: number;
    walking: number;
  };
}

const SPEEDS = {
  car: 50,
  moto: 45,
  bike: 15,
  walking: 5,
};

export async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteResult | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );

    const distKm = parseFloat((route.distance / 1000).toFixed(1));

    return {
      coordinates,
      distanceKm: distKm,
      durationMin: {
        car: Math.ceil((distKm / SPEEDS.car) * 60),
        moto: Math.ceil((distKm / SPEEDS.moto) * 60),
        bike: Math.ceil((distKm / SPEEDS.bike) * 60),
        walking: Math.ceil((distKm / SPEEDS.walking) * 60),
      },
    };
  } catch {
    return null;
  }
}
