import { createApp } from "./app.js";
import { initAuth } from "./config/auth.js";
import { env } from "./config/env.js";
import {
  closeDatabase,
  connectToDatabase,
  getDb,
  getMongoClient,
} from "./database/mongo.js";

async function bootstrap() {
  try {
    await connectToDatabase(env.MONGODB_URI);
    initAuth(getDb(), getMongoClient());

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`FixMate server running on http://localhost:${env.PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down FixMate server...");
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start FixMate server:", error);
    process.exit(1);
  }
}

bootstrap();
