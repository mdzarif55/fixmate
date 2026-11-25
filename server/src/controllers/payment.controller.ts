import type { NextFunction, Request, Response } from "express";
import * as paymentService from "../services/payment.service.js";
import { sendSuccess } from "../utils/responses.js";

export async function createCheckoutSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await paymentService.createCheckoutSessionForBooking(
      req.user!,
      req.body.bookingId
    );
    return sendSuccess(res, session, "Checkout session created.");
  } catch (error) {
    next(error);
  }
}

export async function verifyCheckoutSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId =
      typeof req.query.session_id === "string" ? req.query.session_id : "";
    const result = await paymentService.verifyStripeSessionForCustomer(
      sessionId,
      req.user!.email
    );
    return sendSuccess(res, result, "Payment verified successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getMyPayments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payments = await paymentService.listCustomerPayments(req.user!.email);
    return sendSuccess(res, { payments });
  } catch (error) {
    next(error);
  }
}
