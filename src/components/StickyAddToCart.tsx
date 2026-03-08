import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyAddToCartProps {
  productName: string;
  price: number;
  onAddToCart: () => void;
  visible: boolean;
}

export default function StickyAddToCart({ productName, price, onAddToCart, visible }: StickyAddToCartProps) {
  const isMobile = useIsMobile();

  if (!isMobile || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-2.5 sm:p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold font-display truncate">{productName}</p>
          <p className="text-xs sm:text-sm font-body text-primary font-semibold">₹{price}</p>
        </div>
        <Button variant="hero" size="sm" onClick={onAddToCart} className="shrink-0 gap-1.5 text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4">
          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
