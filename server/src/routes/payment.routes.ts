import { Router } from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { verifyCustomer, verifyToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createCheckoutSessionSchema } from "../validators/payment.validator.js";

const router = Router();

router.post(
  "/create-checkout-session",
  verifyToken,
  verifyCustomer,
  validateBody(createCheckoutSessionSchema),
  paymentController.createCheckoutSession
);
router.get(
  "/verify-session",
  verifyToken,
  verifyCustomer,
  paymentController.verifyCheckoutSession
);
router.get(
  "/my",
  verifyToken,
  verifyCustomer,
  paymentController.getMyPayments
);

export default router;
