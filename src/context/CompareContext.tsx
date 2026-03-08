import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/hooks/useProducts";

interface CompareContextType {
  items: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addToCompare = (product: Product) => {
    if (items.length >= 3) return;
    if (items.find((p) => p.id === product.id)) return;
    setItems((prev) => [...prev, product]);
  };

  const removeFromCompare = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCompare = () => setItems([]);
  const isInCompare = (id: string) => items.some((p) => p.id === id);

  return (
    <CompareContext.Provider value={{ items, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
