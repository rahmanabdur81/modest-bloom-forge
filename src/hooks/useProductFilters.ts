import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/hooks/useProducts";
import { useCategories, getCategoryDescendantIds } from "@/hooks/useCategories";

export interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  colors: string[];
  stockStatus: "all" | "in-stock" | "out-of-stock";
  sortBy: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "All",
  priceRange: [0, 50000],
  colors: [],
  stockStatus: "all",
  sortBy: "newest",
};

export function useProductFilters(products: Product[] | undefined) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: dbCategories } = useCategories();
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") || "All",
    search: searchParams.get("search") || "",
  }));

  // Sync URL category param
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    const search = searchParams.get("search") || "";
    setFilters(prev => ({ ...prev, category: cat, search }));
  }, [searchParams]);

  // Derived: all available colors from products
  const availableColors = useMemo(() => {
    if (!products) return [];
    const colorSet = new Set<string>();
    products.forEach(p => p.colors?.forEach(c => colorSet.add(c)));
    return Array.from(colorSet).sort();
  }, [products]);

  // Derived: price bounds
  const priceBounds = useMemo<[number, number]>(() => {
    if (!products?.length) return [0, 50000];
    const prices = products.map(p => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  // Derived: category counts (on unfiltered products)
  const categoryCounts = useMemo(() => {
    if (!products) return {};
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered products
  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase().replace(/s$/, "");
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }

    // Category — if it's a parent category, include all subcategory names too
    if (filters.category && filters.category !== "All") {
      const matchingCat = dbCategories?.find(
        (c) => c.name.toLowerCase() === filters.category.toLowerCase()
      );
      if (matchingCat && dbCategories) {
        const descendantIds = getCategoryDescendantIds(matchingCat.id, dbCategories);
        const names = descendantIds
          .map((id) => dbCategories.find((c) => c.id === id)?.name)
          .filter(Boolean) as string[];
        result = result.filter((p) =>
          names.some((n) => p.category.toLowerCase() === n.toLowerCase())
        );
      } else {
        result = result.filter(
          (p) => p.category.toLowerCase() === filters.category.toLowerCase()
        );
      }
    }

    // Price range
    result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    // Colors
    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.colors?.some(c => filters.colors.includes(c))
      );
    }

    // Stock status
    if (filters.stockStatus === "in-stock") {
      result = result.filter(p => p.stock > 0);
    } else if (filters.stockStatus === "out-of-stock") {
      result = result.filter(p => p.stock <= 0);
    }

    // Sort
    if (filters.sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === "price-high") result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, filters]);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === "category") {
      const val = value as string;
      if (val === "All") {
        searchParams.delete("category");
      } else {
        searchParams.set("category", val);
      }
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const removeFilter = useCallback((key: keyof FilterState, value?: string) => {
    setFilters(prev => {
      const next = { ...prev };
      if (key === "colors" && value) {
        next.colors = prev.colors.filter(c => c !== value);
      } else if (key === "category") {
        next.category = "All";
        searchParams.delete("category");
        setSearchParams(searchParams, { replace: true });
      } else if (key === "search") {
        next.search = "";
      } else if (key === "priceRange") {
        next.priceRange = priceBounds;
      } else if (key === "stockStatus") {
        next.stockStatus = "all";
      }
      return next;
    });
  }, [priceBounds, searchParams, setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== "All") count++;
    if (filters.priceRange[0] !== priceBounds[0] || filters.priceRange[1] !== priceBounds[1]) count++;
    if (filters.colors.length > 0) count++;
    if (filters.stockStatus !== "all") count++;
    return count;
  }, [filters, priceBounds]);

  return {
    filters,
    filtered,
    availableColors,
    priceBounds,
    categoryCounts,
    activeFilterCount,
    updateFilter,
    clearAllFilters,
    removeFilter,
  };
}
