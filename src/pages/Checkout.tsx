import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
  address: z.string().trim().min(1, "Address is required").max(500),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pincode: z.string().trim().min(6, "Valid pincode required").max(6),
});

export default function Checkout() {
  const { state, totalPrice, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const shipping = totalPrice >= 798 ? 0 : 49;
  const total = totalPrice + shipping;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePlaceOrder = async () => {
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const trackingId = `HP${Date.now().toString(36).toUpperCase()}`;
      dispatch({ type: "CLEAR_CART" });
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation?tracking=${trackingId}`);
      setLoading(false);
    }, 1500);
  };

  if (state.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container-page py-4 sm:py-8 pb-40 lg:pb-16">
        <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            {!user && (
              <div className="bg-accent p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm font-body rounded-lg">
                <span className="text-muted-foreground">Already have an account? </span>
                <a href="/auth" className="font-semibold text-primary underline">Login</a>
                <span className="text-muted-foreground"> for faster checkout.</span>
              </div>
            )}

            <h2 className="font-display text-base sm:text-lg font-semibold mb-4 sm:mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {[
                { key: "fullName", label: "Full Name", full: true },
                { key: "phone", label: "Phone Number", full: true },
                { key: "address", label: "Street Address", full: true },
                { key: "city", label: "City" },
                { key: "state", label: "State" },
                { key: "pincode", label: "Pincode" },
              ].map((field) => (
                <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider font-body mb-1.5 sm:mb-2 block">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full border border-border bg-background px-3 sm:px-4 py-3 sm:py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-11 sm:h-12"
                  />
                  {errors[field.key] && <p className="text-xs text-destructive mt-1 font-body">{errors[field.key]}</p>}
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8">
              <h2 className="font-display text-base sm:text-lg font-semibold mb-4">Payment</h2>
              <div className="bg-secondary p-4 sm:p-6 text-center rounded-lg">
                <p className="font-body text-xs sm:text-sm text-muted-foreground mb-2">Razorpay payment gateway</p>
                <p className="font-body text-xs text-muted-foreground">Secure payment will be processed after clicking "Place Order"</p>
              </div>
            </div>
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden lg:block bg-secondary p-6 h-fit sticky top-24 rounded-lg">
            <h3 className="font-display text-lg font-semibold mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-4 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full mt-6 tap-feedback"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : `Place Order — ₹${total}`}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Order Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3 sm:p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <div className="font-body text-xs">
            <span className="text-muted-foreground">{state.items.length} items</span>
            <span className="mx-1.5">•</span>
            <span className="text-muted-foreground">Shipping: {shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          <p className="font-body font-semibold text-sm sm:text-base">₹{total}</p>
        </div>
        <Button
          variant="hero"
          size="lg"
          className="w-full tap-feedback h-11 sm:h-12 text-xs sm:text-sm"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : `Place Order — ₹${total}`}
        </Button>
      </div>
    </div>
  );
}
