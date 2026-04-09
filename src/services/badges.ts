import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getBadges() {
  return supabase.from("badges").select("*");
}

export async function getUserBadges(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", uid);
}
