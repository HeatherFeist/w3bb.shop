import { Link, Outlet } from "react-router-dom";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/types/domain";
import { Button } from "@/components/ui/button";

const CATEGORIES = Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[];

export function StoreLayout() {
  const { itemCount } = useCart();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="gradient-text text-lg font-semibold">W3BB Shop</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            {CATEGORIES.map((cat) => (
              <Link key={cat} to={`/?category=${cat}`} className="text-muted-foreground hover:text-foreground">
                {PRODUCT_CATEGORY_LABELS[cat]}
              </Link>
            ))}
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              Our Story
            </Link>
          </nav>
          <Button variant="outline" size="icon" className="relative" asChild>
            <Link to="/cart" title="Cart">
              <ShoppingBag className="size-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t bg-secondary/40 py-6 text-center text-sm text-muted-foreground">
        <p>Handmade dream catchers, tie-dye, and DIY kits — made by hand, shipped with love.</p>
        <Link to="/about" className="mt-1 inline-block underline-offset-2 hover:underline sm:hidden">
          Our Story
        </Link>
        <p className="mt-1">&copy; {new Date().getFullYear()} W3BB Shop</p>
      </footer>
    </div>
  );
}
