import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getProfile(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_profiles")
    .select("*")
    .eq("id", uid)
    .single();
}

export async function updateProfile(
  data: {
    name?: string;
    avatar_url?: string;
    cover_url?: string;
    city?: string;
    state?: string;
    travel_since?: string;
    bio?: string;
  },
  userId?: string
) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_profiles")
    .update(data)
    .eq("id", uid);
}
