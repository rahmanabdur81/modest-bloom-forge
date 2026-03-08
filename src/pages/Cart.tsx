import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { state, dispatch, totalPrice, totalItems } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center container-page py-20">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="font-display text-2xl font-semibold mb-3">Your cart is empty</h1>
        <p className="font-body text-muted-foreground mb-8">Discover our beautiful collection of hijabs</p>
        <Link to="/products">
          <Button variant="hero" size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container-page py-8 pb-16">
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-border bg-card">
                <div className="w-24 h-32 bg-secondary shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-medium">{item.name}</h3>
                    {item.color && <p className="text-xs font-body text-muted-foreground mt-1">{item.color}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button className="p-2 hover:bg-secondary" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity - 1 } })}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-body">{item.quantity}</span>
                      <button className="p-2 hover:bg-secondary" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity + 1 } })}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-body font-semibold text-sm">₹{item.price * item.quantity}</span>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })} className="text-muted-foreground hover:text-foreground self-start">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-secondary p-6">
            <h3 className="font-display text-lg font-semibold mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{totalPrice >= 798 ? "Free" : "₹49"}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{totalPrice + (totalPrice >= 798 ? 0 : 49)}</span>
              </div>
            </div>
            <Link to="/checkout" className="block mt-6">
              <Button variant="hero" size="lg" className="w-full">Proceed to Checkout</Button>
            </Link>
            <Link to="/products" className="block mt-3">
              <Button variant="ghost" size="sm" className="w-full text-xs uppercase tracking-wider">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
