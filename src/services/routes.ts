import { supabase } from "@/integrations/supabase/client";

export async function getRoutes() {
  return supabase
    .from("routes")
    .select("*, route_stops(stop_order, note, establishment:establishments(*))")
    .order("sort_order", { ascending: true });
}

export async function getRouteById(id: string) {
  return supabase
    .from("routes")
    .select("*, route_stops(stop_order, note, establishment:establishments(*))")
    .eq("id", id)
    .single();
}
