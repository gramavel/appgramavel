import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

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
  userId?: string
) {
  const uid = userId ?? await getCurrentUserId();
  return supabase.from("reviews").insert({
    user_id: uid,
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
