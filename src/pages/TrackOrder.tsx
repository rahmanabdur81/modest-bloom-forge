import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Truck, MapPin, CheckCircle, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out-for-delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url: string | null;
}

interface OrderResult {
  status: string;
  estimatedDelivery: string;
  lastUpdated: string;
  trackingId: string;
  fullName: string;
  paymentStatus: string;
  total: number;
  items: OrderItem[];
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    const id = trackingId.trim();
    if (!id) {
      setError("Please enter an Order ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: err } = await supabase
        .from("orders")
        .select(`tracking_id, status, estimated_delivery, updated_at, full_name, payment_status, total,
                 order_items ( id, name, quantity, price, image_url )`)
        .eq("tracking_id", id)
        .maybeSingle();

      if (err) throw err;

      if (!data) {
        setError("No order found with this Order ID.");
        return;
      }

      setResult({
        status: data.status,
        estimatedDelivery: data.estimated_delivery || "5-7 business days",
        lastUpdated: new Date(data.updated_at).toLocaleDateString(),
        trackingId: data.tracking_id,
        fullName: data.full_name,
        paymentStatus: data.payment_status,
        total: data.total,
        items: (data as any).order_items || [],
      });
    } catch (err) {
      console.error("Track order error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("id")) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStepIndex = result ? statusSteps.findIndex((s) => s.key === result.status) : -1;

  return (
    <div className="min-h-screen">
      <div className="container-page py-12 sm:py-16 max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-semibold mb-3">Track Your Order</h1>
          <p className="font-body text-sm text-muted-foreground">
            Enter your Order ID along with the email or phone used at checkout.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <Input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter your Order ID"
            className="h-11"
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <Button variant="hero" size="lg" className="w-full" onClick={handleTrack} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Track Order
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 p-4 text-center rounded-lg mb-6">
            <p className="font-body text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-secondary p-5 rounded-lg space-y-2 text-sm font-body">
              <Row label="Tracking ID" value={<span className="font-mono font-semibold">{result.trackingId}</span>} />
              <Row label="Name" value={result.fullName} />
              <Row label="Total" value={`₹${result.total.toLocaleString("en-IN")}`} />
              <Row label="Payment" value={<span className="capitalize">{result.paymentStatus}</span>} />
              <Row label="Estimated Delivery" value={result.estimatedDelivery} />
              <Row label="Last Updated" value={result.lastUpdated} />
            </div>

            {/* Timeline */}
            <div>
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= currentStepIndex;
                return (
                  <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-10 mt-2 ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
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

            {/* Items */}
            {result.items.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-semibold mb-3">Items in this order</h2>
                <div className="space-y-3">
                  {result.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        loading="lazy"
                        className="h-14 w-14 rounded object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                      <p className="font-body text-sm font-semibold">₹{(item.quantity * item.price).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
