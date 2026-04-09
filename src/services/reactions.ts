import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getUserReactions(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_reactions")
    .select("post_id, emoji")
    .eq("user_id", uid);
}

export async function upsertReaction(postId: string, emoji: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();

  const { data: existing } = await supabase
    .from("user_reactions")
    .select("id, emoji")
    .eq("user_id", uid)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      await supabase.from("user_reactions").delete().eq("id", existing.id);
      await supabase.rpc("decrement_reaction", { p_post_id: postId, p_emoji: emoji });
      return { data: null, error: null };
    }
    await supabase.rpc("decrement_reaction", { p_post_id: postId, p_emoji: existing.emoji });
    await supabase.from("user_reactions").delete().eq("id", existing.id);
  }

  const result = await supabase
    .from("user_reactions")
    .insert({ user_id: uid, post_id: postId, emoji });

  await supabase.rpc("increment_reaction", { p_post_id: postId, p_emoji: emoji });

  return result;
}

export async function removeReaction(postId: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();

  const { data: existing } = await supabase
    .from("user_reactions")
    .select("id, emoji")
    .eq("user_id", uid)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.rpc("decrement_reaction", { p_post_id: postId, p_emoji: existing.emoji });
    return supabase.from("user_reactions").delete().eq("id", existing.id);
  }

  return { data: null, error: null };
}
