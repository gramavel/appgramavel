import { supabase } from "@/integrations/supabase/client";

export async function getEstablishments() {
  return supabase
    .from("establishments")
    .select("*")
    .order("rating", { ascending: false });
}

export async function getEstablishmentBySlug(slug: string) {
  return supabase
    .from("establishments")
    .select("*")
    .eq("slug", slug)
    .single();
}

export async function getEstablishmentsByCategory(category: string) {
  return supabase
    .from("establishments")
    .select("*")
    .eq("category", category)
    .order("rating", { ascending: false });
}

export async function getPopularEstablishments() {
  return supabase
    .from("establishments")
    .select("*")
    .eq("is_popular", true)
    .order("rating", { ascending: false })
    .limit(6);
}

export async function getNearbyEstablishments() {
  return supabase
    .from("establishments")
    .select("*")
    .order("distance_km", { ascending: true })
    .limit(6);
}
