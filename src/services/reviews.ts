import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getReviewsByEstablishment(establishmentId: string) {
  return supabase
    .from("reviews")
    .select("*")
    .eq("establishment_id", establishmentId)
    .order("created_at", { ascending: false });
}

export async function createReview(
  establishmentId: string,
  rating: number,
  comment?: string,
  userId = DEV_USER_ID
) {
  return supabase.from("reviews").insert({
    user_id: userId,
    establishment_id: establishmentId,
    rating,
    comment: comment ?? null,
  });
}

export async function updateReview(reviewId: string, rating: number, comment?: string) {
  return supabase
    .from("reviews")
    .update({ rating, comment: comment ?? null })
    .eq("id", reviewId);
}
