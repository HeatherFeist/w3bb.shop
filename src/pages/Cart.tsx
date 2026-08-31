import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { createCheckout } from "@/lib/functions";
import type { PaymentProvider } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const EMPTY_FORM = { name: "", email: "", line1: "", line2: "", city: "", state: "", zip: "", country: "US" };

export default function Cart() {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [submitting, setSubmitting] = useState(false);

  const formValid = form.name.trim() && form.email.trim() && form.line1.trim() && form.city.trim() && form.state.trim() && form.zip.trim();

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || items.length === 0) return;
    setSubmitting(true);
    try {
      const result = await createCheckout({
        provider,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        customer: { name: form.name.trim(), email: form.email.trim() },
        shippingAddress: {
          name: form.name.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim(),
          country: form.country.trim() || "US",
        },
      });
      window.location.href = result.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="space-y-3 py-12 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link to="/">Keep shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-3 rounded-md border p-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.image && <img src={item.image} alt={item.name} className="size-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(item.price_cents)}</p>
            </div>
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
            <p className="w-20 shrink-0 text-right font-medium">
              {formatCurrency(item.price_cents * item.quantity)}
            </p>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.product_id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">Shipping &amp; payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckout} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Full name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Address</Label>
              <Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            </div>
            <Input
              placeholder="Apt, suite, etc. (optional)"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="City"
                className="col-span-1"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
              <Input
                placeholder="ZIP"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5 border-t pt-3">
              <Label className="text-xs">Pay with</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={provider === "stripe" ? "secondary" : "outline"}
                  className="flex-1"
                  onClick={() => setProvider("stripe")}
                >
                  Card (Stripe)
                </Button>
                <Button
                  type="button"
                  variant={provider === "square" ? "secondary" : "outline"}
                  className="flex-1"
                  onClick={() => setProvider("square")}
                >
                  Square
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3 text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotalCents)}</span>
            </div>

            <Button type="submit" className="w-full" disabled={!formValid || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Redirecting…
                </>
              ) : (
                "Checkout"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
