import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getFavorites(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_favorites")
    .select("establishment_id, folder_id")
    .eq("user_id", uid);
}

export async function getFavoriteFolders(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("favorite_folders")
    .select("*")
    .eq("user_id", uid)
    .order("name");
}

export async function addFavorite(establishmentId: string, folderId?: string | null, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_favorites")
    .insert({ user_id: uid, establishment_id: establishmentId, folder_id: folderId });
}

export async function saveFavoriteToFolder(establishmentId: string, folderId: string | null, newFolderName?: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  const { data, error } = await supabase.rpc("save_favorite_to_folder", {
    p_user_id: uid,
    p_establishment_id: establishmentId,
    p_folder_id: folderId,
    p_new_folder_name: newFolderName
  });
  return { data, error };
}

export async function createFavoriteFolder(name: string, userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("favorite_folders")
    .insert({ user_id: uid, name })
    .select()
    .single();
}

export async function deleteFavoriteFolder(folderId: string) {
  return supabase
    .from("favorite_folders")
    .delete()
    .eq("id", folderId);
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
