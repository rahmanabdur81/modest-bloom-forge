import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getProductImage } from "@/hooks/useProducts";

interface RecentlyViewedProps {
  excludeId?: string;
}

const RecentlyViewed = forwardRef<HTMLDivElement, RecentlyViewedProps>(({ excludeId }, ref) => {
  const products = useRecentlyViewed(excludeId);

  if (products.length === 0) return null;

  return (
    <div ref={ref} className="container-page py-8 sm:py-12 px-4">
      <h2 className="font-display text-base sm:text-lg font-semibold mb-4 sm:mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {products.slice(0, 4).map((product) => (
          <Link key={product.id} to={`/product/${product.slug}`} className="group">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-1.5 sm:mb-2">
              <img
                src={getProductImage(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <p className="font-body text-[10px] sm:text-xs text-muted-foreground">{product.category}</p>
            <p className="font-display text-xs sm:text-sm font-medium truncate">{product.name}</p>
            <p className="font-body text-xs sm:text-sm font-bold">₹{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
});

RecentlyViewed.displayName = "RecentlyViewed";

export default RecentlyViewed;
