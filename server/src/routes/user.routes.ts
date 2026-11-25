import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { verifyTechnician, verifyToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/me", verifyToken, userController.getMe);
router.patch(
  "/profile",
  verifyToken,
  validateBody(updateProfileSchema),
  userController.updateProfile
);
router.post(
  "/pro-upgrade",
  verifyToken,
  verifyTechnician,
  userController.upgradePro
);

export default router;
