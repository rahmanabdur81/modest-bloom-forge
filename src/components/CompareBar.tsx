import React from "react";
import { X, ArrowLeftRight } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { getProductImage } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CompareBar = React.forwardRef<HTMLDivElement>(function CompareBar(_props, _ref) {
  const { items, removeFromCompare, clearCompare } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-lg animate-fade-in">
      <div className="container-page py-2 sm:py-3 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto min-w-0">
          <span className="text-[10px] sm:text-xs font-body font-semibold text-muted-foreground shrink-0">
            Compare ({items.length}/3)
          </span>
          {items.map((product) => (
            <div key={product.id} className="flex items-center gap-1.5 sm:gap-2 bg-secondary rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 shrink-0">
              <img
                src={getProductImage(product.image_url)}
                alt={product.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
              />
              <span className="text-[10px] sm:text-xs font-body truncate max-w-[60px] sm:max-w-[100px]">{product.name}</span>
              <button onClick={() => removeFromCompare(product.id)} className="text-muted-foreground hover:text-foreground">
                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={clearCompare} className="text-[10px] sm:text-xs h-7 sm:h-8 px-2">
            Clear
          </Button>
          {items.length >= 2 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm" className="text-[10px] sm:text-xs gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3">
                  <ArrowLeftRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Compare
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto p-3 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="font-display text-base sm:text-xl">Compare Products</DialogTitle>
                </DialogHeader>
                <div className="mt-2 sm:mt-4 overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm font-body">
                    <thead>
                      <tr>
                        <th className="text-left px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase">Feature</th>
                        {items.map((p) => (
                          <th key={p.id} className="text-center px-2 sm:px-3 py-2 min-w-[100px] sm:min-w-[140px]">
                            <img src={getProductImage(p.image_url)} alt={p.name}
                              className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg object-cover mx-auto mb-1.5 sm:mb-2" />
                            <p className="font-display text-[10px] sm:text-xs font-semibold">{p.name}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Price", render: (p: any) => `₹${p.price}` },
                        { label: "Category", render: (p: any) => p.category },
                        { label: "Rating", render: (p: any) => p.avg_rating ? `${Number(p.avg_rating).toFixed(1)} ★` : "—" },
                        { label: "Colors", render: (p: any) => p.colors?.join(", ") || "—" },
                        { label: "Stock", render: (p: any) => p.stock > 0 ? `${p.stock} available` : "Out of stock" },
                        { label: "Discount", render: (p: any) => p.original_price ? `${Math.round((1 - p.price / p.original_price) * 100)}% off` : "—" },
                      ].map((row) => (
                        <tr key={row.label} className="border-t border-border">
                          <td className="px-2 sm:px-3 py-2 text-muted-foreground text-[10px] sm:text-sm">{row.label}</td>
                          {items.map((p) => (
                            <td key={p.id} className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-sm font-semibold">{row.render(p)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
});

export default CompareBar;
