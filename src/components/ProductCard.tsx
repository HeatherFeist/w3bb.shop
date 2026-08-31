import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import type { Product } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.track_stock && (product.stock_qty ?? 0) <= 0;

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square bg-muted">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Package className="size-8" />
            </div>
          )}
        </div>
        <CardContent className="space-y-1 pb-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{product.name}</p>
            {soldOut && <Badge variant="outline">Sold out</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{formatCurrency(product.price_cents)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
