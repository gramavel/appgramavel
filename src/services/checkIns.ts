import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function createCheckIn(
  establishmentId: string,
  coords?: { lat: number; lng: number },
  userId?: string
) {
  const uid = userId ?? await getCurrentUserId();
  return supabase.from("check_ins").insert({
    user_id: uid,
    establishment_id: establishmentId,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
  });
}

export async function getCheckIns(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("check_ins")
    .select("*, establishment:establishments(id,name,logo_url)")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
}

export async function getVisitedEstablishmentIds(userId?: string): Promise<Set<string>> {
  const uid = userId ?? await getCurrentUserId();
  const { data } = await supabase
    .from("check_ins")
    .select("establishment_id")
    .eq("user_id", uid);
  return new Set(data?.map((c) => c.establishment_id) ?? []);
}
