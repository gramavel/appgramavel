import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getTimeline(userId = DEV_USER_ID) {
  return supabase
    .from("user_timeline")
    .select("*, establishment:establishments(name, logo_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
}
