import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, ShoppingBag, Truck, Check } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 798;

export default function Cart() {
  const { state, dispatch, totalPrice, totalItems } = useCart();
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountLeft = FREE_SHIPPING_THRESHOLD - totalPrice;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center container-page py-16 sm:py-20 px-4">
        <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 sm:mb-6" />
        <h1 className="font-display text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Your cart is empty</h1>
        <p className="font-body text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Discover our beautiful collection of hijabs</p>
        <Link to="/products">
          <Button variant="hero" size="lg" className="text-xs sm:text-sm">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container-page py-4 sm:py-8 pb-32 lg:pb-16 px-4">
        <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-8">Shopping Cart</h1>

        {/* Free shipping progress */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-secondary/50 rounded-lg">
          {amountLeft > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <p className="font-body text-xs sm:text-sm text-muted-foreground">
                  Add <span className="font-semibold text-foreground">₹{amountLeft}</span> more for free shipping!
                </p>
              </div>
              <Progress value={shippingProgress} className="h-2" />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <p className="font-body text-xs sm:text-sm font-medium text-primary">You've unlocked free shipping! 🎉</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-border bg-card rounded-lg animate-fade-in">
                <div className="w-20 h-24 sm:w-24 sm:h-32 bg-secondary shrink-0 overflow-hidden rounded">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-display text-xs sm:text-sm font-medium truncate">{item.name}</h3>
                    {item.color && <p className="text-[10px] sm:text-xs font-body text-muted-foreground mt-0.5 sm:mt-1">{item.color}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded">
                      <button className="p-1.5 sm:p-2 hover:bg-secondary transition-colors" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity - 1 } })}>
                        <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </button>
                      <span className="px-2 sm:px-3 text-[10px] sm:text-xs font-body">{item.quantity}</span>
                      <button className="p-1.5 sm:p-2 hover:bg-secondary transition-colors" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity + 1 } })}>
                        <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </button>
                    </div>
                    <span className="font-body font-semibold text-xs sm:text-sm">₹{item.price * item.quantity}</span>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })} className="text-muted-foreground hover:text-foreground self-start transition-colors">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary - desktop */}
          <div className="hidden lg:block">
            <div className="bg-secondary p-4 sm:p-6 rounded-lg h-fit sticky top-20">
              <h3 className="font-display text-base sm:text-lg font-semibold mb-4 sm:mb-6">Order Summary</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{totalPrice >= FREE_SHIPPING_THRESHOLD ? "Free" : "₹49"}</span>
                </div>
                <div className="border-t border-border pt-2 sm:pt-3 flex justify-between font-semibold text-sm sm:text-base">
                  <span>Total</span>
                  <span>₹{totalPrice + (totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 49)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block mt-4 sm:mt-6">
                <Button variant="hero" size="lg" className="w-full text-xs sm:text-sm">Proceed to Checkout</Button>
              </Link>
              <Link to="/products" className="block mt-2 sm:mt-3">
                <Button variant="ghost" size="sm" className="w-full text-[10px] sm:text-xs uppercase tracking-wider">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 lg:hidden z-40">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-xs text-muted-foreground">{totalItems} items</span>
          <span className="font-body font-semibold text-sm">₹{totalPrice + (totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 49)}</span>
        </div>
        <Link to="/checkout">
          <Button variant="hero" size="lg" className="w-full text-xs">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
