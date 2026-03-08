import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProducts, getProductImage } from "@/hooks/useProducts";

interface SearchWithSuggestionsProps {
  onClose: () => void;
}

export default function SearchWithSuggestions({ onClose }: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState("");
  const { data: products } = useProducts();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestions = query.length >= 2
    ? (products || [])
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSelect = (slug: string) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${query.trim()}`);
      onClose();
    }
  };

  return (
    <div className="border-b border-border bg-background animate-fade-in">
      <div className="container-page py-3">
        <div className="relative">
          <div className="flex items-center gap-2 bg-secondary rounded-md px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for hijabs, accessories..."
              className="w-full bg-transparent text-sm font-body focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") onClose();
              }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left"
                >
                  <img
                    src={getProductImage(product.image_url)}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium truncate">{product.name}</p>
                    <p className="text-xs font-body text-muted-foreground">₹{product.price}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2.5 text-xs font-body text-primary hover:bg-secondary transition-colors border-t border-border"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
