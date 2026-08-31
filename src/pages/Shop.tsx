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
      {/* Full-bleed hero: breaks out of the layout's centered max-width so
          the video spans the whole viewport, even though this page's
          content is otherwise constrained. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 h-[380px] w-screen overflow-hidden sm:-mt-8 sm:h-[480px]">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Dims the video so the white text stays readable over any frame. */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white">
          <h1 className="text-3xl font-semibold drop-shadow-sm sm:text-4xl">Handmade, with heart</h1>
          <p className="max-w-xl text-white/90">
            Dream catchers, tie-dye, and DIY kits — each one made by hand.
          </p>
        </div>
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
