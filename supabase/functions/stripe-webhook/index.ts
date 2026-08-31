// Stripe webhook — public, but every request is signature-verified so it
// can't be spoofed. Listens for checkout.session.completed: marks the
// matching order "paid" and decrements stock for any items that track it.
//
// Register this URL in the Stripe Dashboard (Developers -> Webhooks) for
// the "checkout.session.completed" event, then set the signing secret it
// gives you as the STRIPE_WEBHOOK_SECRET function secret.

import { CORS_HEADERS } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const computed = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signatureHeader = req.headers.get("Stripe-Signature");
  const rawBody = await req.text();

  if (!secret || !signatureHeader || !(await verifyStripeSignature(rawBody, signatureHeader, secret))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = serviceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await markOrderPaid(supabase, orderId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});

// deno-lint-ignore no-explicit-any
async function markOrderPaid(supabase: any, orderId: string) {
  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status, items")
    .eq("id", orderId)
    .maybeSingle();

  // Already processed (Stripe can retry webhook delivery) — skip.
  if (!order || order.payment_status === "paid") return;

  await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);

  // Decrement stock for any item that tracks it.
  for (const item of order.items) {
    const { data: product } = await supabase
      .from("products")
      .select("id, track_stock, stock_qty")
      .eq("id", item.product_id)
      .maybeSingle();
    if (product?.track_stock && product.stock_qty !== null) {
      await supabase
        .from("products")
        .update({ stock_qty: Math.max(0, product.stock_qty - item.quantity) })
        .eq("id", product.id);
    }
  }
}
