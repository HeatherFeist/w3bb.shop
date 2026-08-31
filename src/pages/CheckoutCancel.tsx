import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  return (
    <div className="mx-auto max-w-md space-y-3 py-12 text-center">
      <XCircle className="mx-auto size-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Checkout cancelled</h1>
      <p className="text-muted-foreground">No charge was made — your cart is still saved.</p>
      <Button asChild>
        <Link to="/cart">Back to cart</Link>
      </Button>
    </div>
  );
}
