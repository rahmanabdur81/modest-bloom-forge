import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get("tracking") || "N/A";

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="container-page max-w-lg text-center">
        <CheckCircle className="h-16 w-16 text-gold mx-auto mb-6" />
        <h1 className="font-display text-3xl font-semibold mb-3">Order Confirmed!</h1>
        <p className="font-body text-muted-foreground mb-8">
          Thank you for shopping with Modest Grace. Your order has been placed successfully.
        </p>

        <div className="bg-secondary p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-gold" />
            <h3 className="font-display text-sm font-semibold">Tracking Details</h3>
          </div>
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracking ID</span>
              <span className="font-semibold font-mono">{trackingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-gold font-semibold">Processing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span>5-7 business days</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/track-order?id=${trackingId}`}>
            <Button variant="hero" size="lg">Track Order</Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="lg" className="text-xs uppercase tracking-wider">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
