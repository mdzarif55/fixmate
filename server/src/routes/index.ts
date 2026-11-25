import { Router } from "express";
import { getDb } from "../database/mongo.js";
import { sendSuccess } from "../utils/responses.js";
import adminRoutes from "./admin.routes.js";
import bookingRoutes from "./booking.routes.js";
import paymentRoutes from "./payment.routes.js";
import serviceRoutes from "./service.routes.js";
import userRoutes from "./user.routes.js";

export function createApiRouter() {
  const router = Router();

  router.get("/health", async (_req, res, next) => {
    try {
      await getDb().command({ ping: 1 });
      return sendSuccess(
        res,
        {
          status: "ok",
          database: "connected",
          timestamp: new Date().toISOString(),
        },
        "FixMate API is healthy"
      );
    } catch (error) {
      next(error);
    }
  });

  router.use("/services", serviceRoutes);
  router.use("/bookings", bookingRoutes);
  router.use("/payments", paymentRoutes);
  router.use("/admin", adminRoutes);
  router.use("/users", userRoutes);

  return router;
}
