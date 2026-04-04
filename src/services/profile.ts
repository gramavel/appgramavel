import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getProfile(userId = DEV_USER_ID) {
  return supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
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
  },
  userId = DEV_USER_ID
) {
  return supabase
    .from("user_profiles")
    .update(data)
    .eq("id", userId);
}
