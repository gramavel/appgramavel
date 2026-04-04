import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getBadges() {
  return supabase.from("badges").select("*");
}

export async function getUserBadges(userId = DEV_USER_ID) {
  return supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", userId);
}
