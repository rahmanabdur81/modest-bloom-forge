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

// Map slug-based image_url to actual imported images
import imgGeorgette from "@/assets/product-georgette-hijab.jpg";
import imgJersey from "@/assets/product-jersey-hijab.jpg";
import imgChiffon from "@/assets/product-chiffon-hijab.jpg";
import imgSilkSatin from "@/assets/product-silk-satin.jpg";
import imgCotton from "@/assets/product-cotton-hijab.jpg";
import imgOmbre from "@/assets/product-ombre-jersey.jpg";
import imgModal from "@/assets/product-modal-hijab.jpg";
import imgOrganza from "@/assets/product-organza-hijab.jpg";
import imgTurkish from "@/assets/product-turkish-cotton.jpg";
import imgEmbroidered from "@/assets/product-embroidered-georgette.jpg";
import imgUAE from "@/assets/product-uae-luxury.jpg";
import imgKhimar from "@/assets/product-khimar.jpg";
import imgMuna from "@/assets/product-muna-satin.jpg";
import imgCap from "@/assets/product-hijab-cap.jpg";
import imgPins from "@/assets/product-magnetic-pins.jpg";
import imgHamper from "@/assets/product-gift-hamper.jpg";

const imageMap: Record<string, string> = {
  "/product-georgette": imgGeorgette,
  "/product-jersey": imgJersey,
  "/product-chiffon": imgChiffon,
  "/product-silk-satin": imgSilkSatin,
  "/product-cotton": imgCotton,
  "/product-ombre": imgOmbre,
  "/product-modal": imgModal,
  "/product-organza": imgOrganza,
  "/product-turkish": imgTurkish,
  "/product-embroidered": imgEmbroidered,
  "/product-uae": imgUAE,
  "/product-khimar": imgKhimar,
  "/product-muna": imgMuna,
  "/product-cap": imgCap,
  "/product-pins": imgPins,
  "/product-hamper": imgHamper,
};

export function getProductImage(imageUrl: string | null): string {
  if (!imageUrl) return "";
  return imageMap[imageUrl] || imageUrl;
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
