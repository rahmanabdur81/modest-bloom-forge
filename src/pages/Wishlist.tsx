import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts, getProductImage } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { user } = useAuth();
  const { data: wishlistIds, isLoading: loadingWishlist } = useWishlist();
  const { data: allProducts, isLoading: loadingProducts } = useProducts();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center container-page py-20">
        <Heart className="h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="font-display text-2xl font-semibold mb-3">Login to view your wishlist</h1>
        <p className="font-body text-muted-foreground mb-8">Save your favorite hijabs for later</p>
        <Link to="/auth">
          <Button variant="hero" size="lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  const isLoading = loadingWishlist || loadingProducts;
  const wishlistProducts = allProducts?.filter((p) => wishlistIds?.includes(p.id)) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen container-page py-16">
        <h1 className="font-display text-2xl font-semibold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center container-page py-20">
        <Heart className="h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="font-display text-2xl font-semibold mb-3">Your wishlist is empty</h1>
        <p className="font-body text-muted-foreground mb-8">Browse our collection and save your favorites</p>
        <Link to="/products">
          <Button variant="hero" size="lg">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container-page text-center">
          <h1 className="font-display text-3xl font-semibold">My Wishlist</h1>
          <p className="text-sm font-body opacity-70 mt-2">{wishlistProducts.length} items</p>
        </div>
      </div>
      <div className="container-page py-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistProducts.map((product) => (
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
              stock={product.stock}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
