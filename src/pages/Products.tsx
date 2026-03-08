import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProducts, getProductImage } from "@/hooks/useProducts";

const allCategories = ["All", "Hijabs", "Georgette", "Jersey", "Chiffon", "Silk Satin", "Cotton", "Modal", "Khimars", "Accessories", "Gift Hampers"];

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState("newest");

  const { data: products, isLoading } = useProducts();

  let filtered = products || [];
  if (categoryFilter && categoryFilter !== "All") {
    filtered = filtered.filter((p) =>
      p.category.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      p.name.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }
  if (searchQuery) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container-page text-center">
          <p className="text-xs font-body opacity-70 mb-2">
            <Link to="/" className="hover:opacity-100">Home</Link>
            <span className="mx-2">/</span>
            <span>Shop</span>
          </p>
          <h1 className="font-display text-3xl font-semibold">Shop</h1>
        </div>
      </div>

      <div className="container-page py-8 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-56 shrink-0">
            <h3 className="font-display text-lg font-semibold mb-4">Categories</h3>
            <div className="flex flex-row md:flex-col gap-2 flex-wrap">
              {allCategories.map((cat) => (
                <Link
                  key={cat}
                  to={cat === "All" ? "/products" : `/products?category=${cat}`}
                >
                  <Button
                    variant={
                      (cat === "All" && (!categoryFilter || categoryFilter === "All")) || categoryFilter === cat
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    className="text-xs uppercase tracking-wider justify-start w-full"
                  >
                    {cat}
                  </Button>
                </Link>
              ))}
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-body text-muted-foreground">
                {filtered.length} products
              </p>
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
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
              <div className="text-center py-20">
                <h3 className="font-display text-xl mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground font-body">Try a different category or search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
