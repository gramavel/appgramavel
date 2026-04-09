import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getMemories(userId?: string) {
  const uid = userId ?? await getCurrentUserId();
  return supabase
    .from("user_memories")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
}

export async function addMemory(
  imageUrl: string,
  caption?: string,
  establishmentId?: string,
  userId?: string
) {
  const uid = userId ?? await getCurrentUserId();
  return supabase.from("user_memories").insert({
    user_id: uid,
    image_url: imageUrl,
    caption: caption ?? null,
    establishment_id: establishmentId ?? null,
  });
}

export async function deleteMemory(memoryId: string) {
  return supabase.from("user_memories").delete().eq("id", memoryId);
}
