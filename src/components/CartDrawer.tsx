import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, ShoppingBag, Truck, Check } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 798;

export default function CartDrawer() {
  const { state, dispatch, totalItems, totalPrice } = useCart();
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountLeft = FREE_SHIPPING_THRESHOLD - totalPrice;

  return (
    <Sheet open={state.isOpen} onOpenChange={(open) => dispatch({ type: open ? "OPEN_CART" : "CLOSE_CART" })}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-display text-base font-medium mb-1">Your cart is empty</p>
            <p className="font-body text-xs text-muted-foreground mb-6">Discover our beautiful hijab collection</p>
            <Link to="/products" onClick={() => dispatch({ type: "CLOSE_CART" })}>
              <Button variant="hero" size="sm">Shop Now</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="px-4 py-3 bg-secondary/50">
              {amountLeft > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="font-body text-xs text-muted-foreground">
                      Add <span className="font-semibold text-foreground">₹{amountLeft}</span> more for free shipping!
                    </p>
                  </div>
                  <Progress value={shippingProgress} className="h-1.5" />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <p className="font-body text-xs font-medium text-primary">You've unlocked free shipping! 🎉</p>
                </div>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-3 animate-fade-in">
                  <div className="w-16 h-20 bg-secondary shrink-0 overflow-hidden rounded">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-xs font-medium truncate">{item.name}</h4>
                    {item.color && <p className="text-[10px] font-body text-muted-foreground">{item.color}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded">
                        <button className="p-1 hover:bg-secondary transition-colors" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity - 1 } })}>
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="px-2 text-[10px] font-body">{item.quantity}</span>
                        <button className="p-1 hover:bg-secondary transition-colors" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity + 1 } })}>
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <span className="font-body font-semibold text-xs">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })} className="text-muted-foreground hover:text-foreground self-start mt-0.5 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-4 space-y-3 bg-background">
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">Shipping</span>
                <span>{totalPrice >= FREE_SHIPPING_THRESHOLD ? "Free" : "₹49"}</span>
              </div>
              <div className="flex justify-between text-sm font-body font-semibold border-t border-border pt-2">
                <span>Total</span>
                <span>₹{totalPrice + (totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 49)}</span>
              </div>
              <Link to="/checkout" onClick={() => dispatch({ type: "CLOSE_CART" })}>
                <Button variant="hero" size="lg" className="w-full text-xs">Proceed to Checkout</Button>
              </Link>
              <Link to="/cart" onClick={() => dispatch({ type: "CLOSE_CART" })}>
                <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase tracking-wider mt-1">
                  View Full Cart
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
