import { supabase } from "@/integrations/supabase/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? DEV_USER_ID;
}

export { DEV_USER_ID };
