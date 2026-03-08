import { Link } from "react-router-dom";
import { ShoppingBag, Search, Heart, ArrowLeftRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { getProductImage, useProductById } from "@/hooks/useProducts";
import { useCompare } from "@/context/CompareContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  image_url?: string | null;
  category?: string;
  isNew?: boolean | null;
  avg_rating?: number | null;
  review_count?: number | null;
  slug?: string;
}

export default function ProductCard({ id, name, price, originalPrice, image, image_url, category, isNew, avg_rating, slug }: ProductCardProps) {
  const { dispatch } = useCart();
  const { user } = useAuth();
  const { data: wishlistIds } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const isWished = wishlistIds?.includes(id) || false;
  const displayImage = image || getProductImage(image_url || null);
  const productLink = slug ? `/product/${slug}` : `/product/${id}`;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({
      type: "ADD_ITEM",
      payload: { id, name, price, quantity: 1, image: displayImage },
    });
    toast.success("Added to cart!");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Please login to add to wishlist"); return; }
    toggleWishlist.mutate({ productId: id, isWished });
  };

  return (
    <Link to={productLink} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-square rounded-lg mb-3">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {originalPrice && (
          <span className="absolute top-2 left-2 bg-sale text-sale-foreground text-[10px] uppercase tracking-wider font-body font-semibold px-2 py-0.5 rounded">
            Sale!
          </span>
        )}
        {isNew && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-body font-semibold px-2 py-0.5 rounded">
            New
          </span>
        )}
        <CompareButton id={id} name={name} price={price} originalPrice={originalPrice} image_url={image_url} category={category} slug={slug} avg_rating={avg_rating} />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className={`backdrop-blur-sm p-1.5 rounded-full transition-colors ${isWished ? "bg-primary text-primary-foreground" : "bg-background/90 hover:bg-primary hover:text-primary-foreground"}`}
            onClick={handleWishlist}
          >
            <Heart className={`h-3.5 w-3.5 ${isWished ? "fill-current" : ""}`} />
          </button>
          <button className="bg-background/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" onClick={addToCart}>
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {category && (
        <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-body mb-1">{category}</p>
      )}
      <h3 className="font-display text-sm font-medium mb-1 group-hover:text-primary transition-colors line-clamp-2">{name}</h3>
      <div className="flex items-center gap-2">
        {originalPrice && (
          <span className="text-xs font-body text-muted-foreground line-through">₹{originalPrice}</span>
        )}
        <span className="text-sm font-body font-semibold">₹{price}</span>
      </div>
      {avg_rating && avg_rating > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gold">★</span>
          <span className="text-xs font-body text-muted-foreground">{Number(avg_rating).toFixed(1)}</span>
        </div>
      )}
    </Link>
  );
}
