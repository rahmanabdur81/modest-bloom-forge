import { useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeliveryEstimator() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ available: boolean; date: string } | null>(null);

  const checkDelivery = () => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setResult(null);
      return;
    }

    // Simulate delivery estimation
    const today = new Date();
    const pin = parseInt(pincode);

    // Metro cities get faster delivery
    const metroPrefix = [11, 40, 50, 60, 70, 56, 38, 30, 22, 41];
    const prefix = Math.floor(pin / 10000);
    const isMetro = metroPrefix.includes(prefix);
    const daysToAdd = isMetro ? Math.floor(Math.random() * 2) + 3 : Math.floor(Math.random() * 3) + 5;

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysToAdd);

    const formatted = deliveryDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    setResult({ available: true, date: formatted });
  };

  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-4 w-4 text-primary" />
        <p className="font-body text-xs uppercase tracking-wider font-semibold">Check Delivery</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              setResult(null);
            }}
            placeholder="Enter pincode"
            className="w-full bg-secondary rounded-md pl-9 pr-3 py-2.5 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && checkDelivery()}
          />
        </div>
        <Button variant="outline" size="sm" onClick={checkDelivery} className="shrink-0">
          Check
        </Button>
      </div>
      {result && (
        <p className="text-xs font-body text-primary mt-2 flex items-center gap-1.5 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          Estimated delivery by <span className="font-semibold">{result.date}</span>
        </p>
      )}
    </div>
  );
}
