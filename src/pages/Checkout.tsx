import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Shield, CreditCard } from "lucide-react";

const RAZORPAY_KEY_ID = "rzp_test_SZnBuxxwaRegmg";

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
  address: z.string().trim().min(1, "Address is required").max(500),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pincode: z.string().trim().min(6, "Valid pincode required").max(6),
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  // Load Razorpay script
  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

    if (!window.Razorpay) {
      toast.error("Payment gateway is loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Razorpay order via edge function
      const { data: orderData, error: fnError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount: total,
            receipt: `order_${Date.now()}`,
            shippingAddress: { ...formData, shipping },
            items: state.items.map((item) => ({
              productId: item.productId || null,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              color: item.color || null,
              size: item.size || null,
              image: item.image || null,
            })),
          },
        }
      );

      if (fnError || !orderData?.razorpayOrderId) {
        throw new Error(orderData?.error || "Failed to create order");
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Habeeb Paradise",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || "",
        },
        theme: { color: "#000000" },
        handler: async (response: any) => {
          // Step 3: Verify payment
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderData.orderId,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error("Payment verification failed");
            }

            dispatch({ type: "CLEAR_CART" });
            toast.success("Payment successful! Order placed.");
            navigate(`/order-confirmation?tracking=${verifyData.trackingId}`);
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container-page py-8 pb-16">
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!user && (
              <div className="bg-accent p-4 mb-6 text-sm font-body rounded-lg">
                <span className="text-muted-foreground">Already have an account? </span>
                <a href="/auth" className="font-semibold text-primary underline">Login</a>
                <span className="text-muted-foreground"> for faster checkout.</span>
              </div>
            )}

            <h2 className="font-display text-lg font-semibold mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "fullName", label: "Full Name", full: true },
                { key: "phone", label: "Phone Number", full: true },
                { key: "address", label: "Street Address", full: true },
                { key: "city", label: "City" },
                { key: "state", label: "State" },
                { key: "pincode", label: "Pincode" },
              ].map((field) => (
                <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                  <label className="text-xs uppercase tracking-wider font-body mb-2 block">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors[field.key] && <p className="text-xs text-destructive mt-1 font-body">{errors[field.key]}</p>}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold mb-4">Payment</h2>
              <div className="bg-secondary p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <p className="font-body text-sm font-medium">Pay securely via Razorpay</p>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  UPI, Cards, Net Banking, Wallets — all supported. Payment will open after clicking "Place Order".
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">
                    Test Mode — No real charges
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary p-6 h-fit sticky top-24 rounded-lg">
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
              className="w-full mt-6"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : `Place Order — ₹${total}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
