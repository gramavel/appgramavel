import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getFavorites(userId = DEV_USER_ID) {
  return supabase
    .from("user_favorites")
    .select("establishment_id")
    .eq("user_id", userId);
}

export async function addFavorite(establishmentId: string, userId = DEV_USER_ID) {
  return supabase
    .from("user_favorites")
    .insert({ user_id: userId, establishment_id: establishmentId });
}

export async function removeFavorite(establishmentId: string, userId = DEV_USER_ID) {
  return supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("establishment_id", establishmentId);
}

export async function getSavedPosts(userId = DEV_USER_ID) {
  return supabase
    .from("user_saved_posts")
    .select("post_id")
    .eq("user_id", userId);
}

export async function addSavedPost(postId: string, userId = DEV_USER_ID) {
  return supabase
    .from("user_saved_posts")
    .insert({ user_id: userId, post_id: postId });
}

export async function removeSavedPost(postId: string, userId = DEV_USER_ID) {
  return supabase
    .from("user_saved_posts")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);
}
