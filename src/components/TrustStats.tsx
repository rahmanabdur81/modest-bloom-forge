import { useEffect, useRef, useState } from "react";
import { Users, ShoppingBag, Star, Truck } from "lucide-react";

const stats = [
  { icon: Users, value: 5000, suffix: "+", label: "Happy Customers" },
  { icon: ShoppingBag, value: 12000, suffix: "+", label: "Products Sold" },
  { icon: Star, value: 4.8, suffix: "★", label: "Average Rating", decimals: 1 },
  { icon: Truck, value: 500, suffix: "+", label: "Cities Delivered" },
];

function AnimatedCounter({ target, decimals = 0, suffix }: { target: number; decimals?: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return (
    <div ref={ref} className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-primary">
      {display}{suffix}
    </div>
  );
}

export default function TrustStats() {
  return (
    <section className="container-page py-10 sm:py-16 md:py-24">
      <div className="text-center mb-6 sm:mb-12">
        <h2 className="section-heading uppercase text-lg sm:text-xl md:text-2xl">Trusted By Thousands</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 sm:gap-2">
            <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-70 mb-1 sm:mb-2" />
            <AnimatedCounter target={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
            <p className="text-xs sm:text-sm font-body text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
