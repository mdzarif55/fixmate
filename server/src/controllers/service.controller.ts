import type { NextFunction, Request, Response } from "express";
import * as serviceService from "../services/service.service.js";
import { sendSuccess } from "../utils/responses.js";

export async function getPublicServices(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await serviceService.listPublicServices({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      category:
        typeof req.query.category === "string" ? req.query.category : undefined,
      serviceMode:
        typeof req.query.serviceMode === "string"
          ? req.query.serviceMode
          : undefined,
      sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 9,
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getPublicServiceDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await serviceService.getPublicServiceById(
      String(req.params.id)
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function createService(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const created = await serviceService.createTechnicianService(
      req.user!,
      req.body
    );
    return sendSuccess(
      res,
      created,
      "Your service has been submitted for admin approval.",
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getMyTechnicianServices(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await serviceService.listTechnicianServices(req.user!.email);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateService(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const updated = await serviceService.updateTechnicianService(
      String(req.params.id),
      req.user!.email,
      req.body
    );
    return sendSuccess(res, updated, "Service updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function deleteService(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await serviceService.deleteTechnicianService(
      String(req.params.id),
      req.user!.email
    );
    return sendSuccess(res, result, "Service deleted successfully.");
  } catch (error) {
    next(error);
  }
}
