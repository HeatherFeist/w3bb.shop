// POST { provider: "stripe" | "square", items: [{ product_id, quantity }],
//        customer: { name, email }, shippingAddress: {...} }
// Public (no auth) — anyone checking out is a first-time visitor, no
// account needed. Prices are always looked up fresh from the database
// here, never trusted from the browser, so nothing in the request can
// under-charge a customer.
//
// Creates a "pending" order row, then hands off to whichever payment
// provider the customer picked, and returns the URL to redirect them to.
// The order is only ever marked "paid" by the matching webhook
// (stripe-webhook / square-webhook) once the payment actually clears.

import { CORS_HEADERS } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

interface CheckoutItem {
  product_id: string;
  quantity: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  const jsonHeaders = { ...CORS_HEADERS, "Content-Type": "application/json" };

  try {
    const { provider, items, customer, shippingAddress } = (await req.json()) as {
      provider: "stripe" | "square";
      items: CheckoutItem[];
      customer: { name: string; email: string };
      shippingAddress: Record<string, string>;
    };

    if (!items?.length || !customer?.email || !["stripe", "square"].includes(provider)) {
      return new Response(JSON.stringify({ error: "Invalid checkout request" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const supabase = serviceClient();

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price_cents, images, is_active, track_stock, stock_qty")
      .in(
        "id",
        items.map((i) => i.product_id),
      );

    if (productsError) throw productsError;

    const orderItems = items.map((item) => {
      const product = products?.find((p) => p.id === item.product_id);
      if (!product || !product.is_active) {
        throw new Error(`One of the items in your cart is no longer available.`);
      }
      if (product.track_stock && (product.stock_qty ?? 0) < item.quantity) {
        throw new Error(`"${product.name}" doesn't have enough left in stock.`);
      }
      return {
        product_id: product.id,
        name: product.name,
        price_cents: product.price_cents,
        quantity: item.quantity,
      };
    });

    const subtotalCents = orderItems.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
    // v1 has no tax/shipping calculation — total is just the items' subtotal.
    const totalCents = subtotalCents;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        shipping_address: shippingAddress,
        items: orderItems,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        payment_provider: provider,
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const siteUrl = Deno.env.get("SITE_URL") ?? "";
    const successUrl = `${siteUrl}/checkout/success?order_id=${order.id}`;
    const cancelUrl = `${siteUrl}/checkout/cancel?order_id=${order.id}`;

    if (provider === "stripe") {
      const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!secretKey) throw new Error("Stripe isn't configured yet.");

      const params = new URLSearchParams();
      params.set("mode", "payment");
      params.set("success_url", successUrl);
      params.set("cancel_url", cancelUrl);
      params.set("customer_email", customer.email);
      params.set("metadata[order_id]", order.id);
      orderItems.forEach((item, i) => {
        params.set(`line_items[${i}][quantity]`, String(item.quantity));
        params.set(`line_items[${i}][price_data][currency]`, "usd");
        params.set(`line_items[${i}][price_data][unit_amount]`, String(item.price_cents));
        params.set(`line_items[${i}][price_data][product_data][name]`, item.name);
      });

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Stripe error: ${body}`);
      }
      const session = await res.json();

      await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

      return new Response(JSON.stringify({ url: session.url }), { headers: jsonHeaders });
    }

    // --- Square -----------------------------------------------------
    const accessToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
    const locationId = Deno.env.get("SQUARE_LOCATION_ID");
    const squareEnv = Deno.env.get("SQUARE_ENVIRONMENT") === "production" ? "connect.squareup.com" : "connect.squareupsandbox.com";
    if (!accessToken || !locationId) throw new Error("Square isn't configured yet.");

    const res = await fetch(`https://${squareEnv}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-10-17",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: {
          location_id: locationId,
          // Square's own order gets our order id as its reference_id —
          // that's how the webhook matches a Square payment back to the
          // right row in our own orders table.
          reference_id: order.id,
          line_items: orderItems.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            base_price_money: { amount: item.price_cents, currency: "USD" },
          })),
        },
        checkout_options: {
          redirect_url: successUrl,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Square error: ${body}`);
    }
    const data = await res.json();

    await supabase
      .from("orders")
      .update({ square_order_id: data.payment_link?.order_id ?? null })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: data.payment_link.url }), { headers: jsonHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
