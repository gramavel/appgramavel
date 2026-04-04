import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getMemories(userId = DEV_USER_ID) {
  return supabase
    .from("user_memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function addMemory(
  imageUrl: string,
  caption?: string,
  establishmentId?: string,
  userId = DEV_USER_ID
) {
  return supabase.from("user_memories").insert({
    user_id: userId,
    image_url: imageUrl,
    caption: caption ?? null,
    establishment_id: establishmentId ?? null,
  });
}

export async function deleteMemory(memoryId: string) {
  return supabase.from("user_memories").delete().eq("id", memoryId);
}
