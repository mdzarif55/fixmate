import type { NextFunction, Request, Response } from "express";
import * as bookingService from "../services/booking.service.js";
import { sendSuccess } from "../utils/responses.js";

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const booking = await bookingService.createBooking(req.user!, req.body);
    return sendSuccess(
      res,
      booking,
      "Repair request submitted successfully.",
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await bookingService.listCustomerBookings(req.user!.email);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const booking = await bookingService.cancelCustomerBooking(
      String(req.params.id),
      req.user!.email
    );
    return sendSuccess(res, booking, "Booking cancelled successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getTechnicianBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const result = await bookingService.listTechnicianBookings(
      req.user!.email,
      status
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const updated = await bookingService.updateTechnicianBookingStatus(
      String(req.params.id),
      req.user!.email,
      req.body.status,
      req.body.finalAmount
    );
    return sendSuccess(res, updated, "Booking status updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function reviewBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const updated = await bookingService.addCustomerBookingReview(
      String(req.params.id),
      req.user!.email,
      req.body.rating,
      req.body.comment
    );
    return sendSuccess(res, updated, "Thank you for your review!");
  } catch (error) {
    next(error);
  }
}
