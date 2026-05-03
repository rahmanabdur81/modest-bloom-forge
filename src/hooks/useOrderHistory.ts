import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrderHistoryItem = {
  id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  price: number;
  image_url: string | null;
};

export type OrderHistory = {
  id: string;
  tracking_id: string;
  total: number;
  shipping: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderHistoryItem[];
};

export function useOrderHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["order-history", userId],
    enabled: !!userId,
    queryFn: async (): Promise<OrderHistory[]> => {
      // Single round-trip: PostgREST nested embed avoids N+1
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, tracking_id, total, shipping, status, payment_status, created_at,
           order_items ( id, product_id, name, quantity, price, image_url )`
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []).map((o: any) => ({
        id: o.id,
        tracking_id: o.tracking_id,
        total: o.total,
        shipping: o.shipping,
        status: o.status,
        payment_status: o.payment_status,
        created_at: o.created_at,
        items: o.order_items ?? [],
      }));
    },
  });
}
