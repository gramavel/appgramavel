import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getUserRoutes(userId = DEV_USER_ID) {
  return supabase
    .from("user_routes")
    .select("*, user_route_stops(id, stop_order, visited, visited_at, establishment:establishments(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createUserRoute(
  title: string,
  description: string,
  stopIds: string[],
  userId = DEV_USER_ID
) {
  const { data: route, error: routeError } = await supabase
    .from("user_routes")
    .insert({ user_id: userId, title, description })
    .select("id")
    .single();

  if (routeError || !route) return { data: null, error: routeError };

  const stops = stopIds.map((establishmentId, i) => ({
    user_route_id: route.id,
    establishment_id: establishmentId,
    stop_order: i + 1,
  }));

  const { error: stopsError } = await supabase
    .from("user_route_stops")
    .insert(stops);

  return { data: route, error: stopsError };
}

export async function updateUserRouteStatus(
  routeId: string,
  status: "saved" | "in_progress" | "completed"
) {
  const updates: Record<string, unknown> = { status };
  if (status === "in_progress") updates.started_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();

  return supabase.from("user_routes").update(updates).eq("id", routeId);
}

export async function markStopVisited(stopId: string, visited: boolean) {
  return supabase
    .from("user_route_stops")
    .update({ visited, visited_at: visited ? new Date().toISOString() : null })
    .eq("id", stopId);
}

export async function deleteUserRoute(routeId: string) {
  return supabase.from("user_routes").delete().eq("id", routeId);
}
