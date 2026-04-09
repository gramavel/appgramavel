import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getTimeline(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_timeline")
    .select("*, establishment:establishments(name, logo_url)")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(20);
}
