import { supabase } from "@/integrations/supabase/client";

export async function getPosts(
  limit = 30,
  opts?: { category?: string | null; search?: string | null }
) {
  let q = supabase
    .from("posts")
    .select(
      "*, establishment:establishments!inner(id,name,slug,category,rating,total_reviews,logo_url,image_url,distance_km,latitude,longitude,is_popular), reactions(emoji,count)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts?.category) {
    q = q.eq("establishment.category", opts.category);
  }
  if (opts?.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    q = q.or(`name.ilike.${term},description.ilike.${term}`, {
      foreignTable: "establishments",
    });
  }
  return q;
}

export async function getPostsByEstablishment(establishmentId: string) {
  return supabase
    .from("posts")
    .select("*, reactions(emoji,count)")
    .eq("establishment_id", establishmentId)
    .order("created_at", { ascending: false });
}
