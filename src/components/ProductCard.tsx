import { Link } from "react-router-dom";
import { ShoppingBag, Search, Heart } from "lucide-react";
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
    e.stopPropagation();
    dispatch({
      type: "ADD_ITEM",
      payload: { id, name, price, quantity: 1, image },
    });
  };

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-square rounded-lg mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {originalPrice && (
          <span className="absolute top-2 left-2 bg-sale text-sale-foreground text-[10px] uppercase tracking-wider font-body font-semibold px-2 py-0.5 rounded">
            Sale!
          </span>
        )}
        {/* Quick action icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-background/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <Search className="h-3.5 w-3.5" />
          </button>
          <button className="bg-background/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <Heart className="h-3.5 w-3.5" />
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
    </Link>
  );
}
