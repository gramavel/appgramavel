import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

export async function getCoupons() {
  return supabase
    .from("coupons")
    .select("*, establishment:establishments(id,name,logo_url)")
    .eq("status", "active");
}

export async function getAllCoupons() {
  return supabase
    .from("coupons")
    .select("*, establishment:establishments(id,name,logo_url)");
}

export async function getUserCoupons() {
  const userId = await getCurrentUserId();
  return supabase
    .from("user_coupons")
    .select("coupon_id, status, used_at")
    .eq("user_id", userId);
}

export async function saveCoupon(couponId: string) {
  const userId = await getCurrentUserId();
  return supabase
    .from("user_coupons")
    .insert({ user_id: userId, coupon_id: couponId, status: "saved" });
}

export async function unsaveCoupon(couponId: string) {
  const userId = await getCurrentUserId();
  return supabase
    .from("user_coupons")
    .delete()
    .eq("user_id", userId)
    .eq("coupon_id", couponId)
    .eq("status", "saved");
}

export async function useCouponService(couponId: string) {
  const userId = await getCurrentUserId();
  return supabase
    .from("user_coupons")
    .update({ status: "used", used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("coupon_id", couponId)
    .eq("status", "saved");
}
