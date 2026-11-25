import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  bookingsCollection,
  closeDatabase,
  ensureIndexes,
  paymentsCollection,
  servicesCollection,
  setTestDatabase,
  usersCollection,
} from "../database/mongo.js";
import { runSeed } from "../database/seed.js";
import { env } from "../config/env.js";

describe("Database Seed Idempotency", () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    (env as { MONGODB_URI: string }).MONGODB_URI = uri;
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("fixmate_seed_test");
    setTestDatabase(client, db);
    await ensureIndexes(db);
  });

  afterAll(async () => {
    await closeDatabase();
    if (mongod) await mongod.stop();
  });

  it("seeds demo users, 14 services, bookings, and payments idempotently", async () => {
    await runSeed();
    await runSeed(); // Second run must not duplicate records

    const [userCount, serviceCount, bookingCount, paymentCount] =
      await Promise.all([
        usersCollection().countDocuments(),
        servicesCollection().countDocuments(),
        bookingsCollection().countDocuments(),
        paymentsCollection().countDocuments(),
      ]);

    expect(userCount).toBe(5);
    expect(serviceCount).toBe(14);
    expect(bookingCount).toBeGreaterThanOrEqual(4);
    expect(paymentCount).toBeGreaterThanOrEqual(1);
  });
});
