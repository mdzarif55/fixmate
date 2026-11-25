"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SessionUser } from "@/hooks/use-auth-user";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ServiceItem } from "@/types";

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const bookingSchema = z.object({
  customerPhone: z
    .string()
    .trim()
    .min(6, "Phone number is required (minimum 6 digits)."),
  address: z.string().trim().min(5, "Service address is required."),
  preferredDate: z
    .string()
    .min(1, "Preferred date is required.")
    .refine(
      (val) => val >= getTodayDateString(),
      "Preferred date must be today or in the future."
    ),
  problemDescription: z
    .string()
    .trim()
    .min(20, "Please describe the problem in at least 20 characters."),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface RepairRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceItem;
  user: SessionUser;
}

export function RepairRequestForm({
  open,
  onOpenChange,
  service,
  user,
}: RepairRequestFormProps) {
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerPhone: user.phone || "",
      address: user.area || "",
      preferredDate: getTodayDateString(),
      problemDescription: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setSubmitted(false);
      form.reset({
        customerPhone: user.phone || "",
        address: user.area || "",
        preferredDate: getTodayDateString(),
        problemDescription: "",
      });
    }
  }, [open, user.phone, user.area, form]);

  const onSubmit = async (values: BookingFormValues) => {
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        auth: true,
        body: {
          serviceId: service._id,
          ...values,
        },
      });
      setSubmitted(true);
      toast.success("Repair request submitted! Track it in My Bookings.");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not submit repair request.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Request Repair Service</DialogTitle>
          <DialogDescription>
            {service.title} • Starting at {formatCurrency(service.basePrice)} (Pay
            only after completion)
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Request Sent to {service.technicianName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your repair request is currently <strong>requested</strong>. You
              can track status updates or cancel anytime before acceptance.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild>
                <Link href="/dashboard/customer/bookings">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Go to My Bookings</span>
                </Link>
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Your Name</Label>
                <Input value={user.name} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Your Email</Label>
                <Input value={user.email} readOnly className="bg-muted/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="+1 555 010 2345"
                  {...form.register("customerPhone")}
                />
                {form.formState.errors.customerPhone ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.customerPhone.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  min={getTodayDateString()}
                  {...form.register("preferredDate")}
                />
                {form.formState.errors.preferredDate ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.preferredDate.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address / Pickup Location</Label>
              <Input
                id="address"
                placeholder="Street, Apartment, City"
                {...form.register("address")}
              />
              {form.formState.errors.address ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.address.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="problemDescription">
                Problem Description (minimum 20 characters)
              </Label>
              <Textarea
                id="problemDescription"
                rows={4}
                placeholder="Describe the issue, model number, symptoms, and any helpful details..."
                {...form.register("problemDescription")}
              />
              {form.formState.errors.problemDescription ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.problemDescription.message}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Repair Request"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
