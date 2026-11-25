import { z } from "zod";

function getTodayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const createBookingSchema = z.object({
  serviceId: z.string().trim().min(1, "Service ID is required."),
  customerPhone: z
    .string()
    .trim()
    .min(6, "Phone number must be at least 6 characters."),
  address: z.string().trim().min(5, "Address must be at least 5 characters."),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Preferred date must be YYYY-MM-DD.")
    .refine(
      (dateStr) => dateStr >= getTodayUtcDateString(),
      "Preferred date must be today or in the future."
    ),
  problemDescription: z
    .string()
    .trim()
    .min(20, "Problem description must be at least 20 characters."),
});

export const updateBookingStatusSchema = z
  .object({
    status: z.enum(["accepted", "rejected", "in-progress", "completed"]),
    finalAmount: z.coerce.number().positive().optional(),
  })
  .refine(
    (data) =>
      data.status !== "completed" ||
      (typeof data.finalAmount === "number" && data.finalAmount > 0),
    {
      message: "Final amount must be greater than zero when completing a job.",
      path: ["finalAmount"],
    }
  );

export const reviewBookingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(5, "Review comment must be at least 5 characters.")
    .max(500, "Review comment must be 500 characters or fewer."),
});
