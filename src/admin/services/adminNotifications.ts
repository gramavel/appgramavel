import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getAdminNotifications() {
  return supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createNotification(data: {
  title: string;
  body: string;
  type?: string;
  target?: string;
  segment?: string;
  image_url?: string;
  scheduled_at?: string;
}) {
  return supabase.from("admin_notifications").insert({
    ...data,
    type: data.type || "manual",
    target: data.target || "all",
  }).select().single();
}

export async function sendNotification(notifId: string) {
  // Get the admin notification
  const { data: notif } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("id", notifId)
    .single();

  if (!notif) return { error: { message: "Notification not found" } };

  // Get target users
  let userIds: string[] = [];
  if (notif.target === "all") {
    const { data: profiles } = await supabase.from("user_profiles").select("id");
    userIds = profiles?.map(p => p.id) ?? [DEV_USER_ID];
  } else if (notif.target_ids?.length) {
    userIds = notif.target_ids;
  }

  if (userIds.length === 0) userIds = [DEV_USER_ID];

  // Insert notifications for each user
  const notifications = userIds.map(uid => ({
    user_id: uid,
    title: notif.title,
    body: notif.body,
    type: notif.type || "system",
    image_url: notif.image_url,
    reference_id: notif.reference_id,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);

  if (!error) {
    await supabase
      .from("admin_notifications")
      .update({ sent: true, sent_at: new Date().toISOString() } as never)
      .eq("id", notifId);
  }

  return { error };
}
