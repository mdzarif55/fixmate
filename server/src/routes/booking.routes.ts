import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";
import {
  verifyCustomer,
  verifyTechnician,
  verifyToken,
} from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createBookingSchema,
  reviewBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking.validator.js";

const router = Router();

// Customer routes
router.post(
  "/",
  verifyToken,
  verifyCustomer,
  validateBody(createBookingSchema),
  bookingController.createBooking
);
router.get(
  "/my",
  verifyToken,
  verifyCustomer,
  bookingController.getMyBookings
);
router.patch(
  "/:id/cancel",
  verifyToken,
  verifyCustomer,
  bookingController.cancelBooking
);
router.post(
  "/:id/review",
  verifyToken,
  verifyCustomer,
  validateBody(reviewBookingSchema),
  bookingController.reviewBooking
);

// Technician routes
router.get(
  "/technician",
  verifyToken,
  verifyTechnician,
  bookingController.getTechnicianBookings
);
router.patch(
  "/:id/status",
  verifyToken,
  verifyTechnician,
  validateBody(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

export default router;
