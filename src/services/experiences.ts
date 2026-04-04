import { supabase } from "@/integrations/supabase/client";

export async function getExperiences() {
  return supabase
    .from("experiences")
    .select("*")
    .order("sort_order", { ascending: true });
}
