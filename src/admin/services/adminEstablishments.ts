import { supabase } from "@/integrations/supabase/client";

export async function getEstablishments() {
  return supabase
    .from("establishments")
    .select("*")
    .order("name", { ascending: true });
}

export async function getEstablishmentById(id: string) {
  return supabase
    .from("establishments")
    .select("*")
    .eq("id", id)
    .single();
}

export async function createEstablishment(data: Record<string, unknown>) {
  return supabase.from("establishments").insert(data as never).select().single();
}

export async function updateEstablishment(id: string, data: Record<string, unknown>) {
  return supabase.from("establishments").update(data as never).eq("id", id).select().single();
}

export async function deleteEstablishment(id: string) {
  return supabase.from("establishments").delete().eq("id", id);
}

export async function getPhotos(establishmentId: string) {
  return supabase
    .from("establishment_photos")
    .select("*")
    .eq("establishment_id", establishmentId)
    .order("sort_order", { ascending: true });
}

export async function addPhoto(establishmentId: string, url: string, caption: string | null, sortOrder: number) {
  return supabase.from("establishment_photos").insert({
    establishment_id: establishmentId,
    url,
    caption,
    sort_order: sortOrder,
  }).select().single();
}

export async function updatePhoto(id: string, caption: string | null, sortOrder: number) {
  return supabase.from("establishment_photos").update({ caption, sort_order: sortOrder } as never).eq("id", id);
}

export async function deletePhoto(id: string) {
  return supabase.from("establishment_photos").delete().eq("id", id);
}
