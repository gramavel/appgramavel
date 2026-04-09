import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getUserReactions(userId = DEV_USER_ID) {
  return supabase
    .from("user_reactions")
    .select("post_id, emoji")
    .eq("user_id", userId);
}

export async function upsertReaction(postId: string, emoji: string, userId = DEV_USER_ID) {
  // 1. Find existing reaction
  const { data: existing } = await supabase
    .from("user_reactions")
    .select("id, emoji")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      // Toggle off — remove reaction and decrement
      await supabase.from("user_reactions").delete().eq("id", existing.id);
      await supabase.rpc("decrement_reaction", { p_post_id: postId, p_emoji: emoji });
      return { data: null, error: null };
    }
    // Change emoji — decrement old, remove, insert new, increment new
    await supabase.rpc("decrement_reaction", { p_post_id: postId, p_emoji: existing.emoji });
    await supabase.from("user_reactions").delete().eq("id", existing.id);
  }

  // Insert new reaction and increment counter
  const result = await supabase
    .from("user_reactions")
    .insert({ user_id: userId, post_id: postId, emoji });

  await supabase.rpc("increment_reaction", { p_post_id: postId, p_emoji: emoji });

  return result;
}

export async function removeReaction(postId: string, userId = DEV_USER_ID) {
  // Get emoji before removing to decrement counter
  const { data: existing } = await supabase
    .from("user_reactions")
    .select("id, emoji")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.rpc("decrement_reaction", { p_post_id: postId, p_emoji: existing.emoji });
    return supabase.from("user_reactions").delete().eq("id", existing.id);
  }

  return { data: null, error: null };
}
