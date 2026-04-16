import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  stock: number;
  is_new: boolean | null;
  is_active: boolean | null;
  features: string[] | null;
  avg_rating: number | null;
  review_count: number | null;
  created_at: string;
};

export function getProductImage(imageUrl: string | null): string {
  if (!imageUrl) return "https://placehold.co/400x500/e8d5c4/1a1a1a?text=Product";
  const raw = imageUrl.trim();
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }
  return "https://placehold.co/400x500/e8d5c4/1a1a1a?text=Product";
}

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (category && category !== "All") {
        query = query.ilike("category", `%${category}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ["product-id", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}
