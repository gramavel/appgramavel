import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getUserReactions(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_reactions")
    .select("post_id, emoji")
    .eq("user_id", uid);
}
