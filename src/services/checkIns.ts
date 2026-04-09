import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function createCheckIn(
  establishmentId: string,
  coords?: { lat: number; lng: number },
  userId = DEV_USER_ID
) {
  return supabase.from("check_ins").insert({
    user_id: userId,
    establishment_id: establishmentId,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
  });
}

export async function getCheckIns(userId = DEV_USER_ID) {
  return supabase
    .from("check_ins")
    .select("*, establishment:establishments(id,name,logo_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getVisitedEstablishmentIds(userId = DEV_USER_ID): Promise<Set<string>> {
  const { data } = await supabase
    .from("check_ins")
    .select("establishment_id")
    .eq("user_id", userId);
  return new Set(data?.map((c) => c.establishment_id) ?? []);
}
