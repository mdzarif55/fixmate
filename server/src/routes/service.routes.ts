import { Router } from "express";
import * as serviceController from "../controllers/service.controller.js";
import { verifyTechnician, verifyToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/service.validator.js";

const router = Router();

// Public routes
router.get("/", serviceController.getPublicServices);

// Technician protected routes (must come before /:id)
router.get(
  "/technician/my",
  verifyToken,
  verifyTechnician,
  serviceController.getMyTechnicianServices
);
router.post(
  "/",
  verifyToken,
  verifyTechnician,
  validateBody(createServiceSchema),
  serviceController.createService
);
router.patch(
  "/:id",
  verifyToken,
  verifyTechnician,
  validateBody(updateServiceSchema),
  serviceController.updateService
);
router.delete(
  "/:id",
  verifyToken,
  verifyTechnician,
  serviceController.deleteService
);

// Public service details
router.get("/:id", serviceController.getPublicServiceDetails);

export default router;
