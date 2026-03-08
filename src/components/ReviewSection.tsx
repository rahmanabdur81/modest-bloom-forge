import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviews, useAddReview } from "@/hooks/useReviews";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ReviewSectionProps {
  productId: string;
  avgRating: number;
  reviewCount: number;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${star <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer hover:text-gold" : ""}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, avgRating, reviewCount }: ReviewSectionProps) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviews(productId);
  const addReview = useAddReview();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    try {
      await addReview.mutateAsync({ productId, rating, comment, reviewerName: name });
      toast.success("Review submitted!");
      setShowForm(false);
      setRating(0);
      setComment("");
      setName("");
    } catch (err: any) {
      toast.error(err.message?.includes("duplicate") ? "You've already reviewed this product" : "Failed to submit review");
    }
  };

  return (
    <div className="border-t border-border pt-4 sm:pt-8 mt-4 sm:mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h3 className="font-display text-base sm:text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(avgRating || 0)} />
            <span className="text-xs sm:text-sm font-body text-muted-foreground">
              {avgRating?.toFixed(1) || "0.0"} ({reviewCount || 0} reviews)
            </span>
          </div>
        </div>
        {user && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="text-[10px] sm:text-xs uppercase tracking-wider self-start sm:self-auto">
            Write a Review
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="bg-secondary p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-wider font-body mb-1.5 sm:mb-2 block">Your Rating</label>
            <StarRating rating={rating} onRate={setRating} interactive />
          </div>
          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-wider font-body mb-1.5 sm:mb-2 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border bg-background px-3 sm:px-4 py-2 text-xs sm:text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[10px] sm:text-xs uppercase tracking-wider font-body mb-1.5 sm:mb-2 block">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-border bg-background px-3 sm:px-4 py-2 text-xs sm:text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={handleSubmit} disabled={addReview.isPending} className="text-xs">
              {addReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <p className="text-xs sm:text-sm font-body text-muted-foreground">Loading reviews...</p>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-3 sm:pb-4 last:border-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs sm:text-sm font-semibold">{review.reviewer_name || "Anonymous"}</span>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-[10px] sm:text-xs font-body text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="text-xs sm:text-sm font-body text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm font-body text-muted-foreground">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
}
