import { Router } from "express";
import { sendSuccess } from "../utils/responses.js";
import adminRoutes from "./admin.routes.js";
import bookingRoutes from "./booking.routes.js";
import paymentRoutes from "./payment.routes.js";
import serviceRoutes from "./service.routes.js";
import userRoutes from "./user.routes.js";

export function createApiRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    return sendSuccess(
      res,
      { status: "ok", timestamp: new Date().toISOString() },
      "FixMate API is healthy"
    );
  });

  router.use("/services", serviceRoutes);
  router.use("/bookings", bookingRoutes);
  router.use("/payments", paymentRoutes);
  router.use("/admin", adminRoutes);
  router.use("/users", userRoutes);

  return router;
}
