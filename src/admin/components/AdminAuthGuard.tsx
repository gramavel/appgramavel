import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    async function check() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log("AdminAuthGuard: No session found", sessionError);
        setStatus("unauthorized");
        return;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from("admin_roles")
        .select("id, role, is_active")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      console.log("AdminAuthGuard Check:", { userId: session.user.id, adminRole, roleError });
      
      if (adminRole) {
        setStatus("authorized");
      } else {
        console.log("AdminAuthGuard: User is not an active admin");
        setStatus("unauthorized");
      }
    }

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthorized") return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
