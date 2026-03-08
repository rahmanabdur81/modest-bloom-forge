import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getProductImage } from "@/hooks/useProducts";

interface RecentlyViewedProps {
  excludeId?: string;
}

export default function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const products = useRecentlyViewed(excludeId);

  if (products.length === 0) return null;

  return (
    <div className="container-page py-12">
      <h2 className="font-display text-lg font-semibold mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.slug}`}
            className="group"
          >
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-2">
              <img
                src={getProductImage(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <p className="font-body text-xs text-muted-foreground">{product.category}</p>
            <p className="font-display text-sm font-medium truncate">{product.name}</p>
            <p className="font-body text-sm font-bold">₹{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
