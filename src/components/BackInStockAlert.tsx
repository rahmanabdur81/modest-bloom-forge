import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BackInStockAlertProps {
  productName: string;
  productId: string;
}

export default function BackInStockAlert({ productName, productId }: BackInStockAlertProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    // Store in localStorage for now
    const alerts = JSON.parse(localStorage.getItem("stock_alerts") || "[]");
    alerts.push({ email, productId, productName, date: new Date().toISOString() });
    localStorage.setItem("stock_alerts", JSON.stringify(alerts));
    setSubmitted(true);
    toast.success("We'll notify you when it's back!");
  };

  if (submitted) {
    return (
      <div className="bg-secondary rounded-lg p-4 text-center animate-fade-in">
        <Bell className="h-5 w-5 text-primary mx-auto mb-2" />
        <p className="text-sm font-body font-medium">You're on the list!</p>
        <p className="text-xs font-body text-muted-foreground">We'll email you when {productName} is back in stock.</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <p className="font-body text-sm font-semibold">Notify me when available</p>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 bg-background rounded-md px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button variant="hero" size="sm" onClick={handleSubmit} className="shrink-0">
          Notify Me
        </Button>
      </div>
    </div>
  );
}
