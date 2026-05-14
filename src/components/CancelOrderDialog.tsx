import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const REASONS = [
  "Ordered by mistake",
  "Found cheaper elsewhere",
  "Delivery too slow",
  "Other",
];

interface Props {
  orderId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CancelOrderDialog({ orderId, userId, open, onOpenChange }: Props) {
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleCancel = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setLoading(true);
    try {
      const finalReason = reason === "Other" && note.trim() ? `Other: ${note.trim()}` : reason;
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancel_reason: finalReason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Order cancelled successfully");
      qc.invalidateQueries({ queryKey: ["order-history", userId] });
      onOpenChange(false);
      setReason("");
      setNote("");
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Please tell us why you're cancelling.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {reason === "Other" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
              <Label>Tell us more (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Your feedback helps us improve..."
                disabled={loading}
                rows={3}
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Order</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleCancel(); }}
            disabled={loading || !reason}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelling...</>
            ) : (
              "Cancel Order"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
