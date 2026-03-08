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
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[80vh] overflow-hidden bg-secondary">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-page">
              <div className="max-w-xs sm:max-w-md md:max-w-lg">
                <p className="font-body text-xs sm:text-sm md:text-base text-primary-foreground/90 mb-1 sm:mb-2 capitalize">
                  {slide.subtitle}
                </p>
                <h1 className="font-display text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-3 sm:mb-6">
                  {slide.title}
                </h1>
                <Link to={slide.link}>
                  <Button variant="hero" size="lg" className="bg-gold hover:bg-gold/90 text-gold-foreground rounded-full px-6 sm:px-8 text-xs sm:text-sm">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-background/50 transition-colors"
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
      </button>
      <button
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-background/50 transition-colors"
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${i === current ? "bg-primary-foreground" : "bg-primary-foreground/40"}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
