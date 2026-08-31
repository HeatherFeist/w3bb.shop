import { createClient } from "jsr:@supabase/supabase-js@2";

// Service-role client — bypasses RLS. Only ever used server-side, inside
// these edge functions, never sent to the browser.
export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}
