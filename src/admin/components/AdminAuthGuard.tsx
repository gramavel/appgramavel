import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthorized(false); return; }

      const { data } = await supabase
        .from("admin_roles")
        .select("id, role, is_active")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .single();

      setAuthorized(!!data);
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
