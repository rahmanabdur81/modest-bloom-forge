import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProducts, getProductImage } from "@/hooks/useProducts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SaleCountdownBanner from "@/components/SaleCountdownBanner";
import TrustStats from "@/components/TrustStats";
import categoryJersey from "@/assets/category-jersey.jpg";
import categoryChiffon from "@/assets/category-chiffon.jpg";
import categorySilk from "@/assets/category-silk.jpg";

const categories = [
  { name: "Cotton Hijabs", image: categoryJersey, link: "/products?category=Cotton" },
  { name: "Silk & Satin", image: categoryChiffon, link: "/products?category=Silk" },
  { name: "Imported Shawls", image: categorySilk, link: "/products?category=Georgette" },
];

const Index = () => {
  const { data: products, isLoading } = useProducts();
  const featured = products?.slice(0, 6) || [];

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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured.map((product) => (
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

      {/* FAQ */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container-page max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="section-heading uppercase">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="shipping">
              <AccordionTrigger className="font-display text-sm font-semibold text-left">
                How long does delivery take?
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                We deliver across India within 5–7 business days. Orders placed before 2 PM are shipped the same day.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger className="font-display text-sm font-semibold text-left">
                What is your return policy?
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                We offer a 7-day hassle-free return policy. Products must be unused and in original packaging. Contact us via WhatsApp to initiate a return.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cod">
              <AccordionTrigger className="font-display text-sm font-semibold text-left">
                Is Cash on Delivery available?
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                Yes! Cash on Delivery is available across India. You can also pay online via UPI, cards, or net banking.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fabric">
              <AccordionTrigger className="font-display text-sm font-semibold text-left">
                How do I choose the right hijab fabric?
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                Jersey is great for everyday wear (no pins needed), chiffon and georgette are perfect for elegant styling, silk satin is ideal for special occasions, and cotton is best for hot weather. Check our Size & Fabric Guide on each product page for more details.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="free-shipping">
              <AccordionTrigger className="font-display text-sm font-semibold text-left">
                Do you offer free shipping?
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                Yes, we offer free shipping on all orders above ₹798. A flat shipping fee applies for orders below this amount.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="font-display text-sm font-semibold text-left">
                How should I care for my hijab?
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                Hand wash or use a gentle machine cycle in cold water. Air dry away from direct sunlight. Iron on low heat using a cloth barrier for satin and silk fabrics.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Index;
