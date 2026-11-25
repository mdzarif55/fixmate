import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  updateServiceApprovalSchema,
  updateUserRoleSchema,
} from "../validators/admin.validator.js";

const router = Router();

router.use(verifyToken, verifyAdmin);

router.get("/overview", adminController.getOverview);
router.get("/users", adminController.getUsers);
router.patch(
  "/users/:id/role",
  validateBody(updateUserRoleSchema),
  adminController.changeUserRole
);
router.get("/services", adminController.getServices);
router.patch(
  "/services/:id/approval",
  validateBody(updateServiceApprovalSchema),
  adminController.changeServiceApproval
);
router.get("/bookings", adminController.getBookings);
router.get("/payments", adminController.getPayments);

export default router;
