import type { PaymentProvider, ShippingAddress } from "@/types/domain";

const FUNCTIONS_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(
  ".supabase.co",
  ".supabase.co/functions/v1",
);
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function createCheckout(input: {
  provider: PaymentProvider;
  items: { product_id: string; quantity: number }[];
  customer: { name: string; email: string };
  shippingAddress: ShippingAddress;
}) {
  return fetch(`${FUNCTIONS_URL}/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY ?? "" },
    body: JSON.stringify(input),
  }).then(async (res) => {
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error ?? "Checkout failed");
    return json as { url: string };
  });
}
