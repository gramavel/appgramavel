import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getUserReactions(userId = DEV_USER_ID) {
  return supabase
    .from("user_reactions")
    .select("post_id, emoji")
    .eq("user_id", userId);
}

export async function upsertReaction(postId: string, emoji: string, userId = DEV_USER_ID) {
  // First try to find existing reaction
  const { data: existing } = await supabase
    .from("user_reactions")
    .select("id, emoji")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      // Toggle off - remove reaction
      return supabase.from("user_reactions").delete().eq("id", existing.id);
    }
    // Update emoji
    return supabase.from("user_reactions").delete().eq("id", existing.id).then(() =>
      supabase.from("user_reactions").insert({ user_id: userId, post_id: postId, emoji })
    );
  }

  return supabase
    .from("user_reactions")
    .insert({ user_id: userId, post_id: postId, emoji });
}

export async function removeReaction(postId: string, userId = DEV_USER_ID) {
  return supabase
    .from("user_reactions")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);
}
