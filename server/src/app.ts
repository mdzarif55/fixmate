import type { IncomingMessage, ServerResponse } from "node:http";
import cors from "cors";
import express from "express";
import * as helmetModule from "helmet";
import { toNodeHandler } from "better-auth/node";
import { getAuth, initAuth } from "./config/auth.js";
import { env } from "./config/env.js";
import {
  connectToDatabase,
  getDb,
  getMongoClient,
} from "./database/mongo.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { createApiRouter } from "./routes/index.js";
import { handleStripeWebhook } from "./webhooks/stripe.webhook.js";

type HelmetMiddlewareFactory = (options?: {
  crossOriginResourcePolicy?: {
    policy?: "same-origin" | "same-site" | "cross-origin";
  };
}) => express.RequestHandler;

const helmetFn: HelmetMiddlewareFactory =
  typeof helmetModule === "function"
    ? (helmetModule as unknown as HelmetMiddlewareFactory)
    : (helmetModule as unknown as { default: HelmetMiddlewareFactory })
        .default;

export function createApp(webhookHandler: express.RequestHandler = handleStripeWebhook) {
  const app = express();

  const allowedOrigins = Array.from(
    new Set(
      [env.CLIENT_URL, env.BETTER_AUTH_URL, "http://localhost:3000"].filter(
        Boolean
      )
    )
  );

  app.use(
    helmetFn({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );

  // Stripe webhook MUST receive raw body before express.json()
  if (webhookHandler) {
    app.post(
      "/api/webhooks/stripe",
      express.raw({ type: "application/json" }),
      webhookHandler
    );
  }

  // BetterAuth catch-all MUST come before express.json()
  app.all("/api/auth/*", (req, res) => {
    const auth = getAuth();
    return toNodeHandler(auth)(req, res);
  });

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

let serverlessAppPromise: Promise<ReturnType<typeof createApp>> | null = null;

function getServerlessApp() {
  if (!serverlessAppPromise) {
    serverlessAppPromise = (async () => {
      await connectToDatabase(env.MONGODB_URI);
      initAuth(getDb(), getMongoClient());
      return createApp();
    })().catch((err) => {
      serverlessAppPromise = null;
      throw err;
    });
  }
  return serverlessAppPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const app = await getServerlessApp();
  return app(req as never, res as never);
}
