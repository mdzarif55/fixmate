import { Router } from "express";
import { sendSuccess } from "../utils/responses.js";

export function createApiRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    return sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() }, "FixMate API is healthy");
  });

  return router;
}
