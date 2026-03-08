import { useEffect, useState } from "react";

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 8;

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

export function addToRecentlyViewed(product: RecentProduct) {
  try {
    const existing: RecentProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function useRecentlyViewed(excludeId?: string) {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setProducts(excludeId ? stored.filter((p) => p.id !== excludeId) : stored);
    } catch {
      setProducts([]);
    }
  }, [excludeId]);

  return products;
}
