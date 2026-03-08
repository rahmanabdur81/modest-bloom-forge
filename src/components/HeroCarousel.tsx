import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";

const slides = [
  {
    image: hero1,
    subtitle: "Discover Our Premium Collections Of Silk Hijabs",
    title: "Modern Hijabs",
    cta: "SHOP NOW",
    link: "/products?category=hijabs",
  },
  {
    image: hero2,
    subtitle: "modesty meets contemporary fashions",
    title: "Elegance in every fold",
    cta: "SHOP NOW",
    link: "/products?category=new-arrivals",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-secondary">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-page">
              <div className="max-w-lg">
                <p className="font-body text-sm md:text-base text-primary-foreground/90 mb-2 capitalize">
                  {slide.subtitle}
                </p>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
                  {slide.title}
                </h1>
                <Link to={slide.link}>
                  <Button variant="hero" size="lg" className="bg-gold hover:bg-gold/90 text-gold-foreground rounded-full px-8">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-sm p-2 rounded-full hover:bg-background/50 transition-colors"
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft className="h-5 w-5 text-primary-foreground" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-sm p-2 rounded-full hover:bg-background/50 transition-colors"
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
      >
        <ChevronRight className="h-5 w-5 text-primary-foreground" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-primary-foreground" : "bg-primary-foreground/40"}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
