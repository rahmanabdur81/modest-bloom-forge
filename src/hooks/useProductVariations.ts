import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductVariation = {
  id: string;
  product_id: string;
  color: string;
  image_url: string;
  images: string[];
  stock: number;
  price: number | null;
  sku: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function useProductVariations(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-variations", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variations")
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ProductVariation[];
    },
    enabled: !!productId,
  });
}

export function useSaveVariation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: Partial<ProductVariation> & { color: string; image_url: string }) => {
      const payload = {
        product_id: productId,
        color: v.color,
        image_url: v.image_url,
        images: v.images ?? [],
        stock: v.stock ?? 0,
        price: v.price ?? null,
        sku: v.sku ?? null,
        sort_order: v.sort_order ?? 0,
      };
      if (v.id) {
        const { error } = await supabase.from("product_variations").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_variations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-variations", productId] }),
  });
}

export function useDeleteVariation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_variations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-variations", productId] }),
  });
}
