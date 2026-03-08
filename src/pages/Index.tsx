import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import categoryJersey from "@/assets/category-jersey.jpg";
import categoryChiffon from "@/assets/category-chiffon.jpg";
import categorySilk from "@/assets/category-silk.jpg";
import imgCotton from "@/assets/product-cotton-hijab.jpg";
import imgShawl from "@/assets/product-imported-shawl.jpg";
import imgChiffon from "@/assets/product-chiffon-hijab.jpg";
import imgSilkSatin from "@/assets/product-silk-satin.jpg";
import imgModal from "@/assets/product-modal-hijab.jpg";
import imgGeorgette from "@/assets/product-georgette-hijab.jpg";

const featuredProducts = [
  { id: "1", name: "New Cotton Hijabs", price: 599, image: imgCotton, category: "Cotton", isNew: true },
  { id: "2", name: "Premium Imported Shawls", price: 299, originalPrice: 399, image: imgShawl, category: "Imported" },
  { id: "3", name: "Korean Chiffon Hijab", price: 549, image: imgChiffon, category: "Chiffon", isNew: true },
  { id: "4", name: "Silk Satin Hijab", price: 899, image: imgSilkSatin, category: "Silk Satin" },
  { id: "5", name: "Classic Modal Hijab", price: 399, image: imgModal, category: "Modal" },
  { id: "6", name: "Premium Georgette Hijab", price: 599, originalPrice: 799, image: imgGeorgette, category: "Georgette" },
];

const categories = [
  { name: "Cotton Hijabs", image: categoryJersey, link: "/products?category=hijabs" },
  { name: "Silk & Satin", image: categoryChiffon, link: "/products?category=hijabs" },
  { name: "Imported Shawls", image: categorySilk, link: "/products?category=hijabs" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />

      {/* Best Sellers */}
      <section className="container-page py-16 md:py-24">
        <div className="text-center mb-4">
          <h2 className="section-heading uppercase">Best Sellers</h2>
        </div>
        <p className="text-center text-sm font-body text-muted-foreground mb-12 max-w-xl mx-auto">
          All best seller products are now available for you. Shop anytime, anywhere.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/products">
            <Button variant="hero" size="lg" className="rounded-full px-10">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="section-heading uppercase">Shop By Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} {...cat} />
            ))}
          </div>
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
