import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FilterState } from "@/hooks/useProductFilters";
import { Search, X, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  filters: FilterState;
  availableColors: string[];
  priceBounds: [number, number];
  categoryCounts: Record<string, number>;
  activeFilterCount: number;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearAllFilters: () => void;
  onClose?: () => void;
}

const allCategories = ["All", "Hijabs", "Georgette", "Jersey", "Chiffon", "Silk Satin", "Cotton", "Modal", "Khimars", "Accessories", "Gift Hampers", "Luxury", "Organza", "Satin"];

const COLOR_MAP: Record<string, string> = {
  Black: "#000000", White: "#FFFFFF", Red: "#DC2626", Blue: "#2563EB",
  Green: "#16A34A", Pink: "#EC4899", Purple: "#9333EA", Brown: "#92400E",
  Beige: "#D2B48C", Navy: "#1E3A5F", Maroon: "#800000", Grey: "#6B7280",
  Teal: "#0D9488", Cream: "#FFFDD0", Olive: "#808000", Coral: "#FF7F50",
  Peach: "#FFDAB9", Lavender: "#E6E6FA", Mustard: "#FFDB58", Burgundy: "#800020",
  Dusty: "#B4A7D6", Rose: "#FF007F",
};

export default function ProductFilterSidebar({
  filters, availableColors, priceBounds, categoryCounts,
  activeFilterCount, updateFilter, clearAllFilters, onClose,
}: Props) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [localPrice, setLocalPrice] = useState<[number, number]>(filters.priceRange);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => updateFilter("search", searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Sync price from external changes
  useEffect(() => {
    setLocalPrice(filters.priceRange);
  }, [filters.priceRange]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-destructive" onClick={clearAllFilters}>
              <RotateCcw className="h-3 w-3 mr-1" /> Clear All
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Search */}
      <div>
        <label className="text-xs font-medium font-body text-muted-foreground uppercase tracking-wider mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-8 h-9 text-sm"
            aria-label="Search products"
          />
          {searchInput && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchInput("")}>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <label className="text-xs font-medium font-body text-muted-foreground uppercase tracking-wider mb-2 block">Categories</label>
        <div className="space-y-0.5 max-h-52 overflow-y-auto">
          {allCategories.map(cat => {
            const count = cat === "All"
              ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
              : categoryCounts[cat] || 0;
            const isActive = filters.category === cat || (cat === "All" && filters.category === "All");
            return (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-md text-sm font-body transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <label className="text-xs font-medium font-body text-muted-foreground uppercase tracking-wider mb-3 block">
          Price Range
        </label>
        <Slider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={50}
          value={localPrice}
          onValueChange={(v) => setLocalPrice(v as [number, number])}
          onValueCommit={(v) => updateFilter("priceRange", v as [number, number])}
          className="mb-3"
          aria-label="Price range"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={localPrice[0]}
            onChange={e => {
              const v = Number(e.target.value);
              const next: [number, number] = [v, localPrice[1]];
              setLocalPrice(next);
              updateFilter("priceRange", next);
            }}
            className="h-8 text-xs text-center"
            min={priceBounds[0]}
            max={localPrice[1]}
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            value={localPrice[1]}
            onChange={e => {
              const v = Number(e.target.value);
              const next: [number, number] = [localPrice[0], v];
              setLocalPrice(next);
              updateFilter("priceRange", next);
            }}
            className="h-8 text-xs text-center"
            min={localPrice[0]}
            max={priceBounds[1]}
            aria-label="Maximum price"
          />
        </div>
      </div>

      <Separator />

      {/* Colors */}
      {availableColors.length > 0 && (
        <>
          <div>
            <label className="text-xs font-medium font-body text-muted-foreground uppercase tracking-wider mb-2 block">Colors</label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(color => {
                const isSelected = filters.colors.includes(color);
                const hex = COLOR_MAP[color] || "#999";
                return (
                  <button
                    key={color}
                    onClick={() => {
                      const next = isSelected
                        ? filters.colors.filter(c => c !== color)
                        : [...filters.colors, color];
                      updateFilter("colors", next);
                    }}
                    className={`group flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-body transition-all ${
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                    title={color}
                    aria-label={`Filter by ${color}`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-border/50 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="hidden sm:inline">{color}</span>
                    {isSelected && <X className="h-2.5 w-2.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Stock Status */}
      <div>
        <label className="text-xs font-medium font-body text-muted-foreground uppercase tracking-wider mb-2 block">Stock Status</label>
        <div className="space-y-2">
          {([
            { value: "all", label: "All" },
            { value: "in-stock", label: "In Stock" },
            { value: "out-of-stock", label: "Out of Stock" },
          ] as const).map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.stockStatus === opt.value}
                onCheckedChange={() => updateFilter("stockStatus", opt.value)}
                aria-label={opt.label}
              />
              <span className="text-sm font-body">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
