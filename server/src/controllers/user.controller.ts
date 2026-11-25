import type { NextFunction, Request, Response } from "express";
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

export async function upgradePro(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await userService.upgradeTechnicianToPro(req.user!);
    return sendSuccess(res, result, "Upgraded to FixMate Pro!");
  } catch (error) {
    next(error);
  }
}
