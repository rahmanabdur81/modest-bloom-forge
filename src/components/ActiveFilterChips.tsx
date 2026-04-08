import { X } from "lucide-react";
import { FilterState } from "@/hooks/useProductFilters";

interface Props {
  filters: FilterState;
  priceBounds: [number, number];
  removeFilter: (key: keyof FilterState, value?: string) => void;
  clearAllFilters: () => void;
}

export default function ActiveFilterChips({ filters, priceBounds, removeFilter, clearAllFilters }: Props) {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    chips.push({ label: `Search: "${filters.search}"`, onRemove: () => removeFilter("search") });
  }
  if (filters.category !== "All") {
    chips.push({ label: `Category: ${filters.category}`, onRemove: () => removeFilter("category") });
  }
  if (filters.priceRange[0] !== priceBounds[0] || filters.priceRange[1] !== priceBounds[1]) {
    chips.push({ label: `₹${filters.priceRange[0]} – ₹${filters.priceRange[1]}`, onRemove: () => removeFilter("priceRange") });
  }
  filters.colors.forEach(color => {
    chips.push({ label: color, onRemove: () => removeFilter("colors", color) });
  });
  if (filters.stockStatus !== "all") {
    chips.push({ label: filters.stockStatus === "in-stock" ? "In Stock" : "Out of Stock", onRemove: () => removeFilter("stockStatus") });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-body text-muted-foreground">Active:</span>
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-body hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      {chips.length > 1 && (
        <button onClick={clearAllFilters} className="text-xs font-body text-destructive hover:underline">
          Clear all
        </button>
      )}
    </div>
  );
}
