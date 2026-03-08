import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import categoryJersey from "@/assets/category-jersey.jpg";
import categoryChiffon from "@/assets/category-chiffon.jpg";
import categorySilk from "@/assets/category-silk.jpg";

const featuredProducts = [
  { id: "1", name: "Premium Black Georgette Hijab", price: 599, originalPrice: 799, image: "", category: "Georgette", isNew: true },
  { id: "2", name: "Dusty Rose Jersey Hijab", price: 449, image: "", category: "Jersey" },
  { id: "3", name: "Sage Chiffon Hijab", price: 549, image: "", category: "Chiffon", isNew: true },
  { id: "4", name: "Burgundy Silk Satin Hijab", price: 899, image: "", category: "Silk Satin" },
  { id: "5", name: "Classic Black Modal Hijab", price: 399, image: "", category: "Modal" },
  { id: "6", name: "Ivory Cotton Hijab", price: 349, originalPrice: 499, image: "", category: "Cotton" },
  { id: "7", name: "Mauve Ombre Jersey Hijab", price: 649, image: "", category: "Jersey", isNew: true },
  { id: "8", name: "Pearl White Organza Hijab", price: 799, image: "", category: "Organza" },
];

const categories = [
  { name: "Premium Jersey", image: categoryJersey, link: "/products?category=hijabs" },
  { name: "Korean Chiffon", image: categoryChiffon, link: "/products?category=hijabs" },
  { name: "Silk Satin", image: categorySilk, link: "/products?category=hijabs" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />

      {/* Categories */}
      <section className="container-page py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="section-subheading mb-3">Curated For You</p>
          <h2 className="section-heading">The Collection</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container-page">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="section-subheading mb-3">Bestsellers</p>
              <h2 className="section-heading">Most Loved</h2>
            </div>
            <Link to="/products">
              <Button variant="outline" className="hidden sm:inline-flex text-xs uppercase tracking-wider">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-blush py-16 md:py-24">
        <div className="container-page text-center max-w-2xl mx-auto">
          <p className="section-subheading mb-3">Our Promise</p>
          <h2 className="section-heading mb-6">Elegance in Every Drape</h2>
          <p className="font-body text-muted-foreground leading-relaxed mb-8">
            Each hijab is carefully crafted with premium fabrics, ensuring comfort, modesty, and timeless style. 
            From everyday essentials to occasion wear — find your perfect piece.
          </p>
          <Link to="/products">
            <Button variant="hero" size="lg">Shop All Collections</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: "Free Shipping", desc: "On orders above ₹798" },
            { title: "Easy Returns", desc: "7-day hassle-free returns" },
            { title: "Cash on Delivery", desc: "Available across India" },
          ].map((f) => (
            <div key={f.title} className="py-6">
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm font-body text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
