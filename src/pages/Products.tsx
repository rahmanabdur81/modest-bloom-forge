import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProducts, getProductImage } from "@/hooks/useProducts";
import { Filter, X } from "lucide-react";

const allCategories = ["All", "Hijabs", "Georgette", "Jersey", "Chiffon", "Silk Satin", "Cotton", "Modal", "Khimars", "Accessories", "Gift Hampers"];

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useProducts();

  let filtered = products || [];
  if (categoryFilter && categoryFilter !== "All") {
    const filter = categoryFilter.toLowerCase();
    if (filter === "hijabs") {
      const excludeCategories = ["khimars", "accessories", "gift hampers"];
      filtered = filtered.filter((p) => !excludeCategories.includes(p.category.toLowerCase()));
    } else {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase().includes(filter) || p.name.toLowerCase().includes(filter)
      );
    }
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase().replace(/s$/, "");
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    );
  }

  if (sortBy === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-6 sm:py-10">
        <div className="container-page text-center">
          <h1 className="font-display text-xl sm:text-3xl font-semibold">Shop</h1>
        </div>
      </div>

      <div className="container-page py-4 sm:py-8 pb-16">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="h-3 w-3 mr-1" /> : <Filter className="h-3 w-3 mr-1" />}
            {showFilters ? "Close" : "Filters"}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-secondary text-xs font-body px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
          {/* Sidebar - collapsible on mobile */}
          <aside className={`md:w-56 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
            <h3 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4">Categories</h3>
            <div className="flex flex-row md:flex-col gap-1.5 sm:gap-2 flex-wrap">
              {allCategories.map((cat) => (
                <Link
                  key={cat}
                  to={cat === "All" ? "/products" : `/products?category=${cat}`}
                  onClick={() => setShowFilters(false)}
                >
                  <Button
                    variant={
                      (cat === "All" && (!categoryFilter || categoryFilter === "All")) || categoryFilter === cat
                        ? "default" : "ghost"
                    }
                    size="sm"
                    className="text-[10px] sm:text-xs uppercase tracking-wider justify-start w-full"
                  >
                    {cat}
                  </Button>
                </Link>
              ))}
            </div>
          </aside>

          <div className="flex-1">
            {/* Desktop sort */}
            <div className="hidden md:flex items-center justify-between mb-8">
              <p className="text-sm font-body text-muted-foreground">{filtered.length} products</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-secondary text-sm font-body px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile product count */}
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
                {filtered.map((product) => (
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
                  />
                ))}
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <h3 className="font-display text-lg sm:text-xl mb-2">No products found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-body">Try a different category or search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
