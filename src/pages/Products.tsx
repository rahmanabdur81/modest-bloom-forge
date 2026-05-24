import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProducts, getProductImage } from "@/hooks/useProducts";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductFilterSidebar from "@/components/ProductFilterSidebar";
import ActiveFilterChips from "@/components/ActiveFilterChips";
import { useProductFilters } from "@/hooks/useProductFilters";

export default function Products() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: products, isLoading } = useProducts();

  const {
    filters, filtered, availableColors, priceBounds,
    categoryCounts, activeFilterCount, updateFilter,
    clearAllFilters, removeFilter,
  } = useProductFilters(products);

  const filterProps = {
    filters, availableColors, priceBounds, categoryCounts,
    activeFilterCount, updateFilter, clearAllFilters,
  };

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-6 sm:py-10">
        <div className="container-page text-center">
          <h1 className="font-display text-xl sm:text-3xl font-semibold">Shop</h1>
        </div>
      </div>

      <div className="container-page py-4 sm:py-8 pb-16">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setMobileOpen(true)}>
            <Filter className="h-3 w-3 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <select
            value={filters.sortBy}
            onChange={e => updateFilter("sortBy", e.target.value)}
            className="bg-secondary text-xs font-body px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile filter drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[300px] overflow-y-auto p-4">
            <SheetHeader className="mb-4">
              <SheetTitle className="font-display text-lg">Filters</SheetTitle>
            </SheetHeader>
            <ProductFilterSidebar {...filterProps} onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex gap-6 md:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-60 shrink-0">
            <div className="sticky top-4">
              <ProductFilterSidebar {...filterProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Desktop sort + count */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <p className="text-sm font-body text-muted-foreground">
                {isLoading ? "Loading..." : `${filtered.length} products`}
              </p>
              <select
                value={filters.sortBy}
                onChange={e => updateFilter("sortBy", e.target.value)}
                className="bg-secondary text-sm font-body px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Active filter chips */}
            <ActiveFilterChips
              filters={filters}
              priceBounds={priceBounds}
              removeFilter={removeFilter}
              clearAllFilters={clearAllFilters}
            />

            {/* Mobile count */}
            {!isLoading && (
              <p className="text-xs font-body text-muted-foreground mb-3 md:hidden">{filtered.length} products</p>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filtered.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.original_price}
                    image={getProductImage(product.image_url)}
                    category={product.category}
                    isNew={product.is_new}
                    avg_rating={product.avg_rating}
                    slug={product.slug}
                    stock={product.stock}
                  />
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <h3 className="font-display text-lg sm:text-xl mb-2">No products found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-body">Try adjusting your filters or search term.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
