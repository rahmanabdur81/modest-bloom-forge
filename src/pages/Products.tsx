import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const allCategories = ["All", "Hijabs", "Khimars", "Accessories", "Gift Hampers", "New Arrivals"];

// Mock products - will be replaced with DB data
const mockProducts = Array.from({ length: 16 }, (_, i) => ({
  id: String(i + 1),
  name: [
    "Premium Georgette Hijab", "Classic Jersey Hijab", "Korean Chiffon Hijab", "Silk Satin Hijab",
    "Cotton 2.0 Hijab", "Ombre Premium Jersey", "Modal Classic Hijab", "Organza Hijab",
    "Turkish Cotton Hijab", "Embroidered Georgette", "UAE Luxury Hijab", "Fish Tail Khimar",
    "Muna Satin Hijab", "Hijab Cap", "Magnetic Pins Set", "Gift Hamper Premium",
  ][i],
  price: [599, 449, 549, 899, 349, 649, 399, 799, 499, 699, 1299, 899, 749, 199, 149, 1999][i],
  originalPrice: i % 3 === 0 ? [599, 449, 549, 899, 349, 649, 399, 799, 499, 699, 1299, 899, 749, 199, 149, 1999][i] + 200 : undefined,
  image: "",
  category: ["Georgette", "Jersey", "Chiffon", "Silk", "Cotton", "Jersey", "Modal", "Organza", "Cotton", "Georgette", "Luxury", "Khimars", "Satin", "Accessories", "Accessories", "Gift Hampers"][i],
  isNew: i < 4,
}));

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState("newest");

  let filtered = mockProducts;
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
      {/* Breadcrumb */}
      <div className="container-page py-4">
        <div className="text-xs font-body text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Products</span>
        </div>
      </div>

      <div className="container-page pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="md:w-56 shrink-0">
            <h3 className="font-display text-lg font-semibold mb-4">Categories</h3>
            <div className="flex flex-row md:flex-col gap-2 flex-wrap">
              {allCategories.map((cat) => (
                <Link
                  key={cat}
                  to={cat === "All" ? "/products" : `/products?category=${cat.toLowerCase().replace(" ", "-")}`}
                >
                  <Button
                    variant={
                      (cat === "All" && !categoryFilter) || categoryFilter === cat.toLowerCase().replace(" ", "-")
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

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-body text-muted-foreground">
                {filtered.length} products
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-secondary text-sm font-body px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
            {filtered.length === 0 && (
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
