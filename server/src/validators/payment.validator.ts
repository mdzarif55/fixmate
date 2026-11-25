import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking ID is required."),
});
