import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

// Stripe/Square both redirect back here after checkout — the order is
// only ever actually marked "paid" by the webhook, once the payment
// clears server-side, so this page doesn't need to (and can't reliably)
// confirm payment itself. It just clears the cart and thanks the
// customer; a confirmation email is a natural next step to add once
// there's a "send email" edge function wired up for orders.
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-3 py-12 text-center">
      <CheckCircle2 className="mx-auto size-10 text-success" />
      <h1 className="text-2xl font-semibold">Thank you!</h1>
      <p className="text-muted-foreground">
        Your order{orderId ? ` (#${orderId.slice(0, 8)})` : ""} has been received. You'll get an email
        once it ships.
      </p>
      <Button asChild>
        <Link to="/">Keep shopping</Link>
      </Button>
    </div>
  );
}
