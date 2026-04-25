import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the current authenticated user's id, or null if not logged in.
 * Never returns a fake/dev UUID — that caused silent RLS failures and
 * unnecessary requests on the boot path.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
