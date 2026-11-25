import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../src/app.js";
import { initAuth } from "../src/config/auth.js";
import { env } from "../src/config/env.js";
import {
  connectToDatabase,
  getDb,
  getMongoClient,
} from "../src/database/mongo.js";

let appPromise: Promise<ReturnType<typeof createApp>> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      await connectToDatabase(env.MONGODB_URI);
      initAuth(getDb(), getMongoClient());
      return createApp();
    })();
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const app = await getApp();
  return app(req as never, res as never);
}
