import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/responses.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0]?.message || "Validation failed.",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // MongoDB duplicate key error
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    return res.status(409).json({
      success: false,
      message: "Duplicate record conflict.",
    });
  }

  const message =
    err instanceof Error ? err.message : "Internal server error.";
  console.error("[Server Error]:", err);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred."
        : message,
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: "API route not found.",
  });
}
