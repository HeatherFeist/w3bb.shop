import { useSearchParams } from "react-router-dom";
import { useShopProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/types/domain";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get("category") as ProductCategory | null) ?? undefined;
  const { data: products, isLoading } = useShopProducts(category);

  function setCategory(next: ProductCategory | undefined) {
    if (next) setSearchParams({ category: next });
    else setSearchParams({});
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Handmade, with heart</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Dream catchers, tie-dye, and DIY kits — each one made by hand.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={!category ? "secondary" : "outline"}
          size="sm"
          className={cn(!category && "font-semibold")}
          onClick={() => setCategory(undefined)}
        >
          All
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "secondary" : "outline"}
            size="sm"
            className={cn(category === cat && "font-semibold")}
            onClick={() => setCategory(cat)}
          >
            {PRODUCT_CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-center text-muted-foreground">Loading…</p>}
      {!isLoading && (products ?? []).length === 0 && (
        <p className="text-center text-muted-foreground">Nothing here yet — check back soon!</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(products ?? []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
