import { describe, expect, it } from "vitest";
import {
  createBookingSchema,
  reviewBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking.validator.js";
import { createServiceSchema } from "../validators/service.validator.js";
import { updateProfileSchema } from "../validators/user.validator.js";

describe("FixMate Zod Validators", () => {
  it("validates service creation payload and rejects non-positive basePrice", () => {
    const valid = createServiceSchema.safeParse({
      title: "AC Deep Wash",
      category: "AC",
      description: "Full indoor and outdoor unit chemical jet cleaning.",
      image: "https://i.ibb.co/demo/ac.jpg",
      basePrice: 80,
      estimatedDuration: "1.5 hours",
      serviceMode: "Home Visit",
      serviceArea: "Austin, TX",
    });
    expect(valid.success).toBe(true);

    const invalidPrice = createServiceSchema.safeParse({
      title: "AC Deep Wash",
      category: "AC",
      description: "Full indoor and outdoor unit chemical jet cleaning.",
      image: "https://i.ibb.co/demo/ac.jpg",
      basePrice: 0,
      estimatedDuration: "1.5 hours",
      serviceMode: "Home Visit",
      serviceArea: "Austin, TX",
    });
    expect(invalidPrice.success).toBe(false);
  });

  it("enforces minimum 20 chars and future date on booking creation", () => {
    const today = new Date().toISOString().slice(0, 10);
    const shortDesc = createBookingSchema.safeParse({
      serviceId: "507f1f77bcf86cd799439011",
      customerPhone: "555-123-4567",
      address: "123 Main St",
      preferredDate: today,
      problemDescription: "Too short",
    });
    expect(shortDesc.success).toBe(false);

    const pastDate = createBookingSchema.safeParse({
      serviceId: "507f1f77bcf86cd799439011",
      customerPhone: "555-123-4567",
      address: "123 Main St",
      preferredDate: "2020-01-01",
      problemDescription:
        "The appliance stops mid cycle and displays an error code.",
    });
    expect(pastDate.success).toBe(false);
  });

  it("requires positive finalAmount when completing a booking", () => {
    const missingAmount = updateBookingStatusSchema.safeParse({
      status: "completed",
    });
    expect(missingAmount.success).toBe(false);

    const validComplete = updateBookingStatusSchema.safeParse({
      status: "completed",
      finalAmount: 95,
    });
    expect(validComplete.success).toBe(true);
  });

  it("validates booking review bounds and profile schema", () => {
    expect(
      reviewBookingSchema.safeParse({ rating: 6, comment: "Great job!" })
        .success
    ).toBe(false);
    expect(
      reviewBookingSchema.safeParse({ rating: 5, comment: "Great job!" })
        .success
    ).toBe(true);
    expect(updateProfileSchema.safeParse({ name: "Alex" }).success).toBe(true);
  });
});
