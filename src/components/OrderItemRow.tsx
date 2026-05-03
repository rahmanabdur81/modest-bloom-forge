import { useState } from "react";
import { Link } from "react-router-dom";
import type { OrderHistoryItem } from "@/hooks/useOrderHistory";

const FALLBACK = "https://placehold.co/120x120/e8d5c4/1a1a1a?text=Product";

export default function OrderItemRow({ item }: { item: OrderHistoryItem }) {
  const [src, setSrc] = useState(item.image_url || FALLBACK);
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg border border-border bg-background">
        <img
          src={src}
          alt={item.name}
          loading="lazy"
          onError={() => setSrc(FALLBACK)}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        {item.product_id ? (
          <Link
            to={`/product/${item.product_id}`}
            className="font-body text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
          >
            {item.name}
          </Link>
        ) : (
          <span className="font-body text-sm font-medium text-foreground line-clamp-2">{item.name}</span>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">
          {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-body text-sm font-semibold">₹{subtotal.toLocaleString("en-IN")}</div>
      </div>
    </div>
  );
}
