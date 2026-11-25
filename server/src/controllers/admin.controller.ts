import type { NextFunction, Request, Response } from "express";
import * as adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/responses.js";

export async function getOverview(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await adminService.getAdminOverview();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await adminService.listAllUsers();
    return sendSuccess(res, { users });
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const updated = await adminService.updateUserRole(
      String(req.params.id),
      req.body.role,
      req.user!.id,
      req.user!.email
    );
    return sendSuccess(res, updated, "User role updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getServices(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const status =
      typeof req.query.approvalStatus === "string"
        ? req.query.approvalStatus
        : undefined;
    const services = await adminService.listAdminServices(status);
    return sendSuccess(res, { services });
  } catch (error) {
    next(error);
  }
}

export async function changeServiceApproval(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const updated = await adminService.updateServiceApproval(
      String(req.params.id),
      req.body.approvalStatus
    );
    return sendSuccess(
      res,
      updated,
      `Service ${req.body.approvalStatus} successfully.`
    );
  } catch (error) {
    next(error);
  }
}

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const bookings = await adminService.listAdminBookings(status);
    return sendSuccess(res, { bookings });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await adminService.listAdminPayments();
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
