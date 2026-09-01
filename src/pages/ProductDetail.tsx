import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Minus, Package, Plus, ShoppingBag } from "lucide-react";
import { useProductBySlug } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { PRODUCT_CATEGORY_LABELS } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <p className="text-center text-muted-foreground">Loading…</p>;
  if (!product) return <p className="text-center text-muted-foreground">That item couldn't be found.</p>;

  const soldOut = product.track_stock && (product.stock_qty ?? 0) <= 0;
  const maxQuantity = product.track_stock ? Math.max(1, product.stock_qty ?? 1) : 99;

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity} to cart`);
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="space-y-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {product.images[activeImage] ? (
            <img src={product.images[activeImage]} alt={product.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Package className="size-10" />
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`size-16 overflow-hidden rounded-md border-2 ${
                  i === activeImage ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Link to={`/shop?category=${product.category}`} className="text-sm text-muted-foreground hover:underline">
            {PRODUCT_CATEGORY_LABELS[product.category]}
          </Link>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-xl">{formatCurrency(product.price_cents)}</p>
        </div>

        <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>

        {product.track_stock && !soldOut && (product.stock_qty ?? 0) <= 5 && (
          <p className="text-sm text-warning">Only {product.stock_qty} left!</p>
        )}
        {!product.track_stock && (
          <p className="text-sm text-muted-foreground">Made to order — handcrafted just for you.</p>
        )}

        {soldOut ? (
          <p className="font-medium text-destructive">Sold out</p>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingBag /> Add to cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
