import { supabase } from "@/integrations/supabase/client";

export async function getPosts(limit = 30) {
  return supabase
    .from("posts")
    .select(
      "*, establishment:establishments(id,name,slug,category,rating,total_reviews,logo_url,image_url,distance_km,latitude,longitude,is_popular), reactions(emoji,count)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getPostsByEstablishment(establishmentId: string) {
  return supabase
    .from("posts")
    .select("*, reactions(emoji,count)")
    .eq("establishment_id", establishmentId)
    .order("created_at", { ascending: false });
}
