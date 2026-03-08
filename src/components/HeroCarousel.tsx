import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";

const slides = [
  {
    image: hero1,
    subtitle: "New Collection",
    title: "Premium Georgette",
    description: "Discover our luxurious range of premium georgette hijabs",
    cta: "Shop Now",
    link: "/products?category=hijabs",
  },
  {
    image: hero2,
    subtitle: "Exclusive",
    title: "Ombre Premium",
    description: "Handcrafted ombre hijabs in stunning color transitions",
    cta: "Explore",
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
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-secondary">
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
                <p className="section-subheading text-primary-foreground/80 mb-3">{slide.subtitle}</p>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 italic">
                  {slide.title}
                </h1>
                <p className="font-body text-primary-foreground/80 mb-8 text-sm md:text-base">
                  {slide.description}
                </p>
                <Link to={slide.link}>
                  <Button variant="hero" size="xl">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-sm p-2 hover:bg-background/50 transition-colors"
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft className="h-5 w-5 text-primary-foreground" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-sm p-2 hover:bg-background/50 transition-colors"
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
      >
        <ChevronRight className="h-5 w-5 text-primary-foreground" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-8 h-0.5 transition-all ${i === current ? "bg-primary-foreground" : "bg-primary-foreground/40"}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
