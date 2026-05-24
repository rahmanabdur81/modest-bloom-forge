import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

/**
 * Revalidates cart item stock against the database on mount / when cart opens.
 * - Adjusts quantities that exceed live stock
 * - Removes items that are now out of stock
 * - Notifies user when changes happen
 */
export function useCartStockSync(trigger?: unknown) {
  const { state, dispatch } = useCart();
  const itemsRef = useRef(state.items);
  itemsRef.current = state.items;

  useEffect(() => {
    let cancelled = false;
    const items = itemsRef.current;
    if (items.length === 0) return;

    (async () => {
      const productIds = Array.from(
        new Set(items.map((i) => i.productId).filter((x): x is string => !!x))
      );
      const variationIds = Array.from(
        new Set(items.map((i) => i.variationId).filter((x): x is string => !!x))
      );

      const stockMap: Record<string, number> = {};

      if (productIds.length) {
        const { data } = await supabase
          .from("products")
          .select("id, stock")
          .in("id", productIds);
        data?.forEach((p) => {
          stockMap[p.id] = Math.max(0, p.stock ?? 0);
        });
      }

      if (variationIds.length) {
        const { data } = await supabase
          .from("product_variations")
          .select("id, stock, size_stock")
          .in("id", variationIds);
        data?.forEach((v) => {
          stockMap[v.id] = Math.max(0, v.stock ?? 0);
        });
        // Variation deleted → stock 0
        variationIds.forEach((id) => {
          if (stockMap[id] == null) stockMap[id] = 0;
        });
      }

      if (cancelled) return;

      // Detect changes before dispatching
      const willChange = items.some((i) => {
        const key = i.variationId || i.productId;
        if (!key) return false;
        const avail = stockMap[key];
        if (avail == null) return false;
        return i.quantity > avail;
      });

      dispatch({ type: "SYNC_STOCK", payload: stockMap });

      if (willChange) {
        toast.info("Cart updated based on latest stock");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
}
