import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getNotifications(userId = DEV_USER_ID) {
  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
}

export async function getUnreadCount(userId = DEV_USER_ID) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return { data: count ?? 0, error };
}

export async function markAllRead(userId = DEV_USER_ID) {
  return supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

export async function markRead(notificationId: string) {
  return supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
}
