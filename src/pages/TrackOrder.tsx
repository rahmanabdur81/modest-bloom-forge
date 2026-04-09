import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Truck, MapPin, CheckCircle, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out-for-delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

interface OrderResult {
  status: string;
  estimatedDelivery: string;
  lastUpdated: string;
  trackingId: string;
  fullName: string;
  paymentStatus: string;
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    const id = trackingId.trim();
    if (!id) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("tracking_id, status, estimated_delivery, updated_at, full_name, payment_status")
        .eq("tracking_id", id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setResult({
          status: data.status,
          estimatedDelivery: data.estimated_delivery || "5-7 business days",
          lastUpdated: new Date(data.updated_at).toLocaleDateString(),
          trackingId: data.tracking_id,
          fullName: data.full_name,
          paymentStatus: data.payment_status,
        });
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Track order error:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if URL has id param
  useState(() => {
    if (searchParams.get("id")) {
      handleTrack();
    }
  });

  const currentStepIndex = result ? statusSteps.findIndex((s) => s.key === result.status) : -1;

  return (
    <div className="min-h-screen">
      <div className="container-page py-16 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-semibold mb-3">Track Your Order</h1>
          <p className="font-body text-sm text-muted-foreground">Enter your tracking ID to check order status</p>
        </div>

        <div className="flex gap-2 mb-12">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter tracking ID (e.g., HP...)"
            className="flex-1 border border-border bg-background px-4 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <Button variant="hero" size="lg" onClick={handleTrack} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Track
          </Button>
        </div>

        {notFound && (
          <div className="bg-destructive/10 p-6 text-center rounded-lg">
            <p className="font-body text-sm text-destructive">No order found with this tracking ID. Please check and try again.</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in">
            <div className="bg-secondary p-6 mb-8 rounded-lg">
              <div className="flex justify-between text-sm font-body mb-2">
                <span className="text-muted-foreground">Tracking ID</span>
                <span className="font-mono font-semibold">{result.trackingId}</span>
              </div>
              <div className="flex justify-between text-sm font-body mb-2">
                <span className="text-muted-foreground">Name</span>
                <span>{result.fullName}</span>
              </div>
              <div className="flex justify-between text-sm font-body mb-2">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize">{result.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-sm font-body mb-2">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span>{result.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{result.lastUpdated}</span>
              </div>
            </div>

            {/* Progress tracker */}
            <div className="relative">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= currentStepIndex;
                return (
                  <div key={step.key} className="flex items-start gap-4 mb-8 last:mb-0">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-12 mt-2 ${
                          i < currentStepIndex ? "bg-primary" : "bg-muted"
                        }`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`font-body text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {isActive && i === currentStepIndex && (
                        <p className="text-xs font-body text-muted-foreground mt-1">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
