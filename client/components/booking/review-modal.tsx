"use client";

import * as React from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { BookingItem } from "@/types";

interface ReviewModalProps {
  booking: BookingItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReviewModal({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setRating(5);
      setComment("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (comment.trim().length < 5) {
      toast.error("Please write a short review (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/api/bookings/${booking._id}/review`, {
        method: "POST",
        auth: true,
        body: { rating, comment: comment.trim() },
      });
      toast.success("Thank you for reviewing this repair service!");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Repair Experience</DialogTitle>
          <DialogDescription>
            {booking?.serviceTitle} • Technician: {booking?.technicianName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Star Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} stars`}
                  className="rounded-lg p-1.5 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-foreground">
                {rating} / 5
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-comment">Your Review</Label>
            <Textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how punctual, transparent, and effective the technician was..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
