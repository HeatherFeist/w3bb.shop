import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

// Gates every /admin/* route — needs both a signed-in session AND a row
// in admin_users (see docs/schema_v1_shop.sql). Anyone else lands back on
// the admin login screen.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id);

  if (authLoading || (user && adminLoading)) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">Loading…</div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
