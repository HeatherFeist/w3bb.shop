import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Checks the admin_users table (see docs/schema_v1_shop.sql) — a signed-in
// user only sees the admin dashboard once someone's manually added their
// auth user id there.
export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is_admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}
