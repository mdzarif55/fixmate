import { Collection, Db, MongoClient } from "mongodb";
import { env } from "../config/env.js";
import type {
  BookingDoc,
  PaymentDoc,
  ServiceDoc,
  UserDoc,
} from "../types/index.js";

let client: MongoClient | null = null;
let db: Db | null = null;
let indexesInitialized = false;

export async function connectToDatabase(uri = env.MONGODB_URI): Promise<Db> {
  if (db && client) {
    return db;
  }

  client = new MongoClient(uri);
  await client.connect();
  const resolvedDb = client.db();
  db =
    !resolvedDb.databaseName || resolvedDb.databaseName === "test"
      ? client.db("fixmate")
      : resolvedDb;

  if (!indexesInitialized) {
    await ensureIndexes(db);
    indexesInitialized = true;
  }

  return db;
}

export function setTestDatabase(testClient: MongoClient, testDb: Db): void {
  client = testClient;
  db = testDb;
  indexesInitialized = false;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
  }
  return client;
}

export function getDb(): Db {
  if (!db) {
    const resolvedDb = getMongoClient().db();
    db =
      !resolvedDb.databaseName || resolvedDb.databaseName === "test"
        ? getMongoClient().db("fixmate")
        : resolvedDb;
  }
  return db;
}

export function usersCollection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>("users");
}

export function servicesCollection(): Collection<ServiceDoc> {
  return getDb().collection<ServiceDoc>("services");
}

export function bookingsCollection(): Collection<BookingDoc> {
  return getDb().collection<BookingDoc>("bookings");
}

export function paymentsCollection(): Collection<PaymentDoc> {
  return getDb().collection<PaymentDoc>("payments");
}

export async function ensureIndexes(database: Db): Promise<void> {
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database
      .collection("services")
      .createIndex({ approvalStatus: 1, isAvailable: 1, createdAt: -1 }),
    database
      .collection("services")
      .createIndex({ category: 1, serviceMode: 1 }),
    database.collection("services").createIndex({ technicianEmail: 1 }),
    database
      .collection("bookings")
      .createIndex({ customerEmail: 1, createdAt: -1 }),
    database
      .collection("bookings")
      .createIndex({ technicianEmail: 1, createdAt: -1 }),
    database.collection("bookings").createIndex(
      { serviceId: 1, customerEmail: 1 },
      {
        unique: true,
        partialFilterExpression: {
          status: { $in: ["requested", "accepted", "in-progress"] },
        },
        name: "unique_active_booking_per_customer_service",
      }
    ),
    database
      .collection("payments")
      .createIndex({ stripeSessionId: 1 }, { unique: true }),
    database
      .collection("payments")
      .createIndex({ bookingId: 1 }, { unique: true }),
  ]);
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    indexesInitialized = false;
  }
}
