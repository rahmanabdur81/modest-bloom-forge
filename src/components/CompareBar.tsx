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

export default function CompareBar() {
  const { items, removeFromCompare, clearCompare } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-lg animate-fade-in">
      <div className="container-page py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-body font-semibold text-muted-foreground shrink-0">
            Compare ({items.length}/3)
          </span>
          {items.map((product) => (
            <div key={product.id} className="flex items-center gap-2 bg-secondary rounded-lg px-2 py-1.5 shrink-0">
              <img
                src={getProductImage(product.image_url)}
                alt={product.name}
                className="w-8 h-8 rounded object-cover"
              />
              <span className="text-xs font-body truncate max-w-[100px]">{product.name}</span>
              <button onClick={() => removeFromCompare(product.id)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={clearCompare} className="text-xs">
            Clear
          </Button>
          {items.length >= 2 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm" className="text-xs gap-1.5">
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Compare
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Compare Products</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2 text-xs text-muted-foreground font-semibold uppercase">Feature</th>
                        {items.map((p) => (
                          <th key={p.id} className="text-center px-3 py-2 min-w-[140px]">
                            <img
                              src={getProductImage(p.image_url)}
                              alt={p.name}
                              className="w-20 h-20 rounded-lg object-cover mx-auto mb-2"
                            />
                            <p className="font-display text-xs font-semibold">{p.name}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2.5 text-muted-foreground">Price</td>
                        {items.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 text-center font-semibold">₹{p.price}</td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2.5 text-muted-foreground">Category</td>
                        {items.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 text-center">{p.category}</td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2.5 text-muted-foreground">Rating</td>
                        {items.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 text-center">
                            {p.avg_rating ? `${Number(p.avg_rating).toFixed(1)} ★` : "—"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2.5 text-muted-foreground">Colors</td>
                        {items.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 text-center text-xs">
                            {p.colors?.join(", ") || "—"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2.5 text-muted-foreground">Stock</td>
                        {items.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 text-center">
                            {p.stock > 0 ? `${p.stock} available` : "Out of stock"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2.5 text-muted-foreground">Discount</td>
                        {items.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 text-center">
                            {p.original_price
                              ? `${Math.round((1 - p.price / p.original_price) * 100)}% off`
                              : "—"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
