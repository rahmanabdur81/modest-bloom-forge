import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import imgGeorgette from "@/assets/product-georgette-hijab.jpg";
import imgJersey from "@/assets/product-jersey-hijab.jpg";
import imgChiffon from "@/assets/product-chiffon-hijab.jpg";
import imgSilkSatin from "@/assets/product-silk-satin.jpg";
import imgCotton from "@/assets/product-cotton-hijab.jpg";
import imgOmbre from "@/assets/product-ombre-jersey.jpg";
import imgModal from "@/assets/product-modal-hijab.jpg";
import imgOrganza from "@/assets/product-organza-hijab.jpg";
import imgTurkish from "@/assets/product-turkish-cotton.jpg";
import imgEmbroidered from "@/assets/product-embroidered-georgette.jpg";
import imgUAE from "@/assets/product-uae-luxury.jpg";
import imgKhimar from "@/assets/product-khimar.jpg";
import imgMuna from "@/assets/product-muna-satin.jpg";
import imgCap from "@/assets/product-hijab-cap.jpg";
import imgPins from "@/assets/product-magnetic-pins.jpg";
import imgHamper from "@/assets/product-gift-hamper.jpg";

const allCategories = ["All", "Hijabs", "Khimars", "Accessories", "Gift Hampers", "New Arrivals"];

const mockProducts = [
  { id: "1", name: "Premium Georgette Hijab", price: 599, originalPrice: 799, image: imgGeorgette, category: "Georgette", isNew: true },
  { id: "2", name: "Classic Jersey Hijab", price: 449, image: imgJersey, category: "Jersey" },
  { id: "3", name: "Korean Chiffon Hijab", price: 549, image: imgChiffon, category: "Chiffon", isNew: true },
  { id: "4", name: "Silk Satin Hijab", price: 899, image: imgSilkSatin, category: "Silk", isNew: true },
  { id: "5", name: "Cotton 2.0 Hijab", price: 349, originalPrice: 549, image: imgCotton, category: "Cotton" },
  { id: "6", name: "Ombre Premium Jersey", price: 649, image: imgOmbre, category: "Jersey", isNew: true },
  { id: "7", name: "Modal Classic Hijab", price: 399, image: imgModal, category: "Modal" },
  { id: "8", name: "Organza Hijab", price: 799, image: imgOrganza, category: "Organza" },
  { id: "9", name: "Turkish Cotton Hijab", price: 499, image: imgTurkish, category: "Cotton" },
  { id: "10", name: "Embroidered Georgette", price: 699, image: imgEmbroidered, category: "Georgette" },
  { id: "11", name: "UAE Luxury Hijab", price: 1299, image: imgUAE, category: "Luxury" },
  { id: "12", name: "Fish Tail Khimar", price: 899, originalPrice: 1099, image: imgKhimar, category: "Khimars" },
  { id: "13", name: "Muna Satin Hijab", price: 749, image: imgMuna, category: "Satin" },
  { id: "14", name: "Hijab Cap", price: 199, image: imgCap, category: "Accessories" },
  { id: "15", name: "Magnetic Pins Set", price: 149, image: imgPins, category: "Accessories" },
  { id: "16", name: "Gift Hamper Premium", price: 1999, image: imgHamper, category: "Gift Hampers" },
];

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
      {/* Page header */}
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
                      (cat === "All" && (!categoryFilter || categoryFilter === "All")) || categoryFilter === cat.toLowerCase().replace(" ", "-")
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
                className="bg-secondary text-sm font-body px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
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
