import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getFavorites(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_favorites")
    .select("establishment_id")
    .eq("user_id", uid);
}

export async function addFavorite(establishmentId: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_favorites")
    .insert({ user_id: uid, establishment_id: establishmentId });
}

export async function removeFavorite(establishmentId: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", uid)
    .eq("establishment_id", establishmentId);
}

export async function getSavedPosts(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_saved_posts")
    .select("post_id")
    .eq("user_id", uid);
}

export async function addSavedPost(postId: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_saved_posts")
    .insert({ user_id: uid, post_id: postId });
}

export async function removeSavedPost(postId: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_saved_posts")
    .delete()
    .eq("user_id", uid)
    .eq("post_id", postId);
}
