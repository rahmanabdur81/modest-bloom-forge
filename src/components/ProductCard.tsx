import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  isNew?: boolean;
}

export default function ProductCard({ id, name, price, originalPrice, image, category, isNew }: ProductCardProps) {
  const { dispatch } = useCart();

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({
      type: "ADD_ITEM",
      payload: { id, name, price, quantity: 1, image },
    });
  };

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {isNew && (
          <span className="absolute top-3 left-3 bg-gold text-gold-foreground text-[10px] uppercase tracking-wider font-body font-semibold px-3 py-1">
            New
          </span>
        )}
        {originalPrice && (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] uppercase tracking-wider font-body font-semibold px-3 py-1">
            Sale
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="hero" size="sm" className="w-full" onClick={addToCart}>
            <ShoppingBag className="h-3 w-3 mr-1" /> Add to Cart
          </Button>
        </div>
      </div>
      {category && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">{category}</p>
      )}
      <h3 className="font-display text-sm font-medium mb-1 group-hover:text-gold transition-colors">{name}</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-body font-semibold">₹{price}</span>
        {originalPrice && (
          <span className="text-xs font-body text-muted-foreground line-through">₹{originalPrice}</span>
        )}
      </div>
    </Link>
  );
}
