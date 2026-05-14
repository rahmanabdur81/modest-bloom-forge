import { useState } from "react";
import { ChevronDown, Package, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import OrderItemRow from "./OrderItemRow";
import CancelOrderDialog from "./CancelOrderDialog";
import { useAuth } from "@/context/AuthContext";
import type { OrderHistory } from "@/hooks/useOrderHistory";
import { cn } from "@/lib/utils";

const CANCELLABLE = new Set(["pending", "processing"]);

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 border-green-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OrderCard({ order }: { order: OrderHistory }) {
  const [open, setOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { user } = useAuth();
  const statusKey = order.status?.toLowerCase() ?? "processing";
  const canCancel = CANCELLABLE.has(statusKey);
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 text-primary items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-heading text-sm sm:text-base font-semibold truncate">
                    Order #{order.tracking_id || order.id.slice(0, 8)}
                  </span>
                  <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[statusKey] ?? "")}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="font-heading font-semibold text-sm sm:text-base">
                  ₹{order.total.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                  {order.payment_status}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300",
                  open && "rotate-180",
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="border-t border-border bg-muted/20 px-4 sm:px-5 py-4 space-y-3">
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}

            <div className="pt-3 mt-3 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{itemsTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shipping > 0 ? `₹${order.shipping}` : "Free"}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-1">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <Link
                to={`/track-order?id=${encodeURIComponent(order.tracking_id)}`}
                className="text-sm text-primary hover:underline font-body"
              >
                Track this order →
              </Link>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canCancel}
                  onClick={() => setCancelOpen(true)}
                  className={cn(
                    "gap-1.5",
                    canCancel && "text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
                  )}
                  title={canCancel ? "Cancel this order" : "This order can no longer be cancelled"}
                >
                  <XCircle className="h-4 w-4" />
                  {statusKey === "cancelled" ? "Cancelled" : "Cancel Order"}
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      {user && (
        <CancelOrderDialog
          orderId={order.id}
          userId={user.id}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
        />
      )}
    </Card>
  );
}
