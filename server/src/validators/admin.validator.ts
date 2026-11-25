import { z } from "zod";
import { USER_ROLES } from "../utils/constants.js";

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export const updateServiceApprovalSchema = z.object({
  approvalStatus: z.enum(["approved", "rejected"]),
});
