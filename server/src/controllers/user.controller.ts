import type { NextFunction, Request, Response } from "express";
import * as paymentService from "../services/payment.service.js";
import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/responses.js";

export async function getMe(req: Request, res: Response) {
  return sendSuccess(res, { user: req.user });
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const updated = await userService.updateUserProfile(req.user!, req.body);
    return sendSuccess(res, updated, "Profile updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function createProCheckoutSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await paymentService.createProUpgradeCheckoutSession(
      req.user!
    );
    return sendSuccess(res, session, "Pro upgrade checkout session created.");
  } catch (error) {
    next(error);
  }
}

export async function verifyProCheckoutSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId =
      typeof req.query.session_id === "string" ? req.query.session_id : "";
    const result = await paymentService.verifyProUpgradeSessionForTechnician(
      sessionId,
      req.user!.email
    );
    return sendSuccess(
      res,
      result,
      "Pro Technician plan activated successfully!"
    );
  } catch (error) {
    next(error);
  }
}
