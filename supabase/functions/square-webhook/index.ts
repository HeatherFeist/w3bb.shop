// Square webhook — public, but every request is signature-verified so it
// can't be spoofed. Listens for "payment.updated" events: when a payment
// reaches COMPLETED, looks up its Square order to find our own order id
// (stored as the Square order's reference_id at checkout time — see
// create-checkout), then marks that order "paid" and decrements stock.
//
// Register this URL in the Square Developer Dashboard (Webhooks) for the
// "payment.updated" event, then set the signature key it gives you as the
// SQUARE_WEBHOOK_SIGNATURE_KEY function secret. Square signs against the
// exact notification URL you registered, so SQUARE_WEBHOOK_URL must match
// that exactly (e.g. https://<project>.supabase.co/functions/v1/square-webhook).

import { CORS_HEADERS } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

async function verifySquareSignature(body: string, notificationUrl: string, signatureKey: string, signatureHeader: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signatureKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(notificationUrl + body));
  const computed = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
  return computed === signatureHeader;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const signatureKey = Deno.env.get("SQUARE_WEBHOOK_SIGNATURE_KEY");
  const notificationUrl = Deno.env.get("SQUARE_WEBHOOK_URL");
  const signatureHeader = req.headers.get("x-square-hmacsha256-signature");
  const rawBody = await req.text();

  if (
    !signatureKey ||
    !notificationUrl ||
    !signatureHeader ||
    !(await verifySquareSignature(rawBody, notificationUrl, signatureKey, signatureHeader))
  ) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = serviceClient();

  if (event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment?.status === "COMPLETED" && payment.order_id) {
      const accessToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
      const squareEnv =
        Deno.env.get("SQUARE_ENVIRONMENT") === "production" ? "connect.squareup.com" : "connect.squareupsandbox.com";
      const orderRes = await fetch(`https://${squareEnv}/v2/orders/${payment.order_id}`, {
        headers: { Authorization: `Bearer ${accessToken}`, "Square-Version": "2024-10-17" },
      });
      const orderData = await orderRes.json();
      const orderId = orderData.order?.reference_id;
      if (orderId) {
        await markOrderPaid(supabase, orderId);
      }
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

  if (!order || order.payment_status === "paid") return;

  await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);

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
