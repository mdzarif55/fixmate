import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { initAuth } from "../config/auth.js";
import { env } from "../config/env.js";
import {
  closeDatabase,
  ensureIndexes,
  setTestDatabase,
  usersCollection,
} from "../database/mongo.js";
import {
  finalizePaidBookingFromSession,
  finalizeProUpgradeFromSession,
} from "../services/payment.service.js";

describe("FixMate Backend API & Security Integration Tests", () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let app: ReturnType<typeof createApp>;

  let customerToken = "";
  let techToken = "";
  let adminToken = "";
  let adminId = "";
  let customerId = "";

  let serviceId1 = "";
  let bookingId1 = "";

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("fixmate_test");

    setTestDatabase(client, db);
    await ensureIndexes(db);
    initAuth(db, client);
    app = createApp();
  });

  afterAll(async () => {
    await closeDatabase();
    if (mongod) {
      await mongod.stop();
    }
  });

  async function signUpAndGetToken(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const signUpRes = await request(app)
      .post("/api/auth/sign-up/email")
      .set("Origin", env.BETTER_AUTH_URL)
      .send(payload);

    if (signUpRes.status !== 200) {
      return { signUpRes, token: "" };
    }

    const cookies = signUpRes.headers["set-cookie"];
    const tokenRes = await request(app)
      .get("/api/auth/token")
      .set("Origin", env.BETTER_AUTH_URL)
      .set("Cookie", cookies);

    return {
      signUpRes,
      token: tokenRes.body?.token as string,
      user: signUpRes.body?.user as { id: string; email: string; role: string },
    };
  }

  async function signInAndGetToken(email: string, password: string) {
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .set("Origin", env.BETTER_AUTH_URL)
      .send({ email, password });

    const cookies = res.headers["set-cookie"];
    const tokenRes = await request(app)
      .get("/api/auth/token")
      .set("Origin", env.BETTER_AUTH_URL)
      .set("Cookie", cookies);

    return {
      token: tokenRes.body?.token as string,
      user: res.body?.user,
    };
  }

  it("blocks public admin registration and allows customer & technician signups with JWT", async () => {
    const adminAttempt = await request(app)
      .post("/api/auth/sign-up/email")
      .set("Origin", env.BETTER_AUTH_URL)
      .send({
        name: "Hacker Admin",
        email: "hacker@fixmate.app",
        password: "Password123",
        role: "admin",
      });
    expect(adminAttempt.status).toBeGreaterThanOrEqual(400);

    const cust = await signUpAndGetToken({
      name: "Alice Customer",
      email: "alice@fixmate.app",
      password: "Password123",
      role: "customer",
    });
    expect(cust.signUpRes.status).toBe(200);
    expect(cust.token).toBeTruthy();
    customerToken = cust.token;
    customerId = cust.user!.id;

    const tech = await signUpAndGetToken({
      name: "Bob Tech",
      email: "bob@fixmate.app",
      password: "Password123",
      role: "technician",
    });
    expect(tech.signUpRes.status).toBe(200);
    expect(tech.token).toBeTruthy();
    techToken = tech.token;

    // Seed an admin directly in MongoDB (no public admin signup)
    await signUpAndGetToken({
      name: "Root Admin",
      email: "root@fixmate.app",
      password: "Password123",
      role: "customer",
    });
    await usersCollection().updateOne(
      { email: "root@fixmate.app" },
      { $set: { role: "admin" } }
    );
    const adminDoc = await usersCollection().findOne({
      email: "root@fixmate.app",
    });
    adminId = String(adminDoc!._id);
    const adminSignIn = await signInAndGetToken(
      "root@fixmate.app",
      "Password123"
    );
    adminToken = adminSignIn.token;
    expect(adminToken).toBeTruthy();
  });

  it("enforces 401 for missing tokens and 403 for wrong roles", async () => {
    const noToken = await request(app).get("/api/bookings/my");
    expect(noToken.status).toBe(401);

    const custToAdmin = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(custToAdmin.status).toBe(403);

    const techToCustomer = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${techToken}`)
      .send({});
    expect(techToCustomer.status).toBe(403);
  });

  it("manages service lifecycle, free-plan limit, admin approval, edit re-approval, and server-side filtering", async () => {
    const basePayload = {
      title: "iPhone 15 OLED Screen Repair",
      category: "Smartphone",
      description:
        "Complete OEM OLED screen replacement with Face ID retention and warranty.",
      image: "https://i.ibb.co/demo/screen.jpg",
      basePrice: 95,
      estimatedDuration: "1 hour",
      serviceMode: "Shop Drop-off",
      serviceArea: "Austin, TX",
    };

    const create1 = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${techToken}`)
      .send(basePayload);
    expect(create1.status).toBe(201);
    expect(create1.body.data.approvalStatus).toBe("pending");
    serviceId1 = String(create1.body.data._id);

    // Pending service must NOT appear in public listing
    const publicBefore = await request(app).get("/api/services");
    expect(publicBefore.status).toBe(200);
    expect(publicBefore.body.data.services.length).toBe(0);

    // Create 2 more services (free plan limit = 3)
    const create2 = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        ...basePayload,
        title: "Split AC Deep Cleaning",
        category: "AC",
        basePrice: 70,
        serviceMode: "Home Visit",
      });
    expect(create2.status).toBe(201);

    const create3 = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        ...basePayload,
        title: "Washing Machine Drum Fix",
        category: "Washing Machine",
        basePrice: 120,
        serviceMode: "Home Visit",
      });
    expect(create3.status).toBe(201);

    // 4th service blocked on free plan
    const create4Blocked = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${techToken}`)
      .send({ ...basePayload, title: "Laptop Thermal Service" });
    expect(create4Blocked.status).toBe(403);

    // Admin approves all 3 services
    for (const id of [
      serviceId1,
      String(create2.body.data._id),
      String(create3.body.data._id),
    ]) {
      const appr = await request(app)
        .patch(`/api/admin/services/${id}/approval`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ approvalStatus: "approved" });
      expect(appr.status).toBe(200);
    }

    // Server-side filter & sort test
    const filtered = await request(app).get(
      "/api/services?serviceMode=Home+Visit&sort=price-low&page=1&limit=1"
    );
    expect(filtered.status).toBe(200);
    expect(filtered.body.data.services.length).toBe(1);
    expect(filtered.body.data.services[0].basePrice).toBe(70);
    expect(filtered.body.data.pagination.total).toBe(2);
    expect(filtered.body.data.pagination.totalPages).toBe(2);

    // Technician edits approved service -> resets to pending
    const edited = await request(app)
      .patch(`/api/services/${create2.body.data._id}`)
      .set("Authorization", `Bearer ${techToken}`)
      .send({ basePrice: 75 });
    expect(edited.status).toBe(200);
    expect(edited.body.data.approvalStatus).toBe("pending");
  });

  it("enforces booking duplicate guard, status pipeline, payment gate, and idempotent payment finalization", async () => {
    const today = new Date().toISOString().slice(0, 10);

    const bookRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        serviceId: serviceId1,
        customerPhone: "+1 555-111-2222",
        address: "100 Congress Ave, Austin, TX",
        preferredDate: today,
        problemDescription:
          "My iPhone screen cracked and half the display has green lines.",
      });
    expect(bookRes.status).toBe(201);
    bookingId1 = String(bookRes.body.data._id);

    // Duplicate active request must fail with exact message
    const dupRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        serviceId: serviceId1,
        customerPhone: "+1 555-111-2222",
        address: "100 Congress Ave, Austin, TX",
        preferredDate: today,
        problemDescription:
          "Submitting another active booking for the exact same service.",
      });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toBe(
      "You already have an active request for this service."
    );

    // Payment before completion must be rejected
    const earlyPay = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ bookingId: bookingId1 });
    expect(earlyPay.status).toBe(400);

    // Invalid status jump requested -> completed must be rejected
    const invalidJump = await request(app)
      .patch(`/api/bookings/${bookingId1}/status`)
      .set("Authorization", `Bearer ${techToken}`)
      .send({ status: "completed", finalAmount: 110 });
    expect(invalidJump.status).toBe(400);

    // Valid pipeline: requested -> accepted -> in-progress -> completed
    const s1 = await request(app)
      .patch(`/api/bookings/${bookingId1}/status`)
      .set("Authorization", `Bearer ${techToken}`)
      .send({ status: "accepted" });
    expect(s1.status).toBe(200);

    // Customer cannot cancel an accepted booking
    const cancelAccepted = await request(app)
      .patch(`/api/bookings/${bookingId1}/cancel`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(cancelAccepted.status).toBe(400);

    const s2 = await request(app)
      .patch(`/api/bookings/${bookingId1}/status`)
      .set("Authorization", `Bearer ${techToken}`)
      .send({ status: "in-progress" });
    expect(s2.status).toBe(200);

    const s3 = await request(app)
      .patch(`/api/bookings/${bookingId1}/status`)
      .set("Authorization", `Bearer ${techToken}`)
      .send({ status: "completed", finalAmount: 115 });
    expect(s3.status).toBe(200);
    expect(s3.body.data.finalAmount).toBe(115);

    // Webhook signature rejection test
    const badWebhook = await request(app)
      .post("/api/webhooks/stripe")
      .set("Content-Type", "application/json")
      .send(Buffer.from(JSON.stringify({ id: "evt_test" })));
    expect(badWebhook.status).toBe(400);

    // Idempotent payment finalization test (simulating verified Stripe session + retry)
    const fakeSession = {
      id: "cs_test_integration_001",
      payment_status: "paid",
      payment_intent: "pi_test_integration_001",
      metadata: {
        bookingId: bookingId1,
        customerEmail: "alice@fixmate.app",
      },
    } as never;

    const p1 = await finalizePaidBookingFromSession(fakeSession);
    const p2 = await finalizePaidBookingFromSession(fakeSession);
    expect(String(p1.payment._id)).toBe(String(p2.payment._id));
    expect(p2.booking?.paymentStatus).toBe("paid");

    // Review allowed once after payment
    const rev1 = await request(app)
      .post(`/api/bookings/${bookingId1}/review`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ rating: 5, comment: "Amazing repair quality and super fast!" });
    expect(rev1.status).toBe(200);

    const revDup = await request(app)
      .post(`/api/bookings/${bookingId1}/review`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ rating: 4, comment: "Duplicate review should be blocked." });
    expect(revDup.status).toBe(409);
  });

  it("prevents admin self-role change and supports profile updates", async () => {
    const selfRole = await request(app)
      .patch(`/api/admin/users/${adminId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "customer" });
    expect(selfRole.status).toBe(400);

    const roleUpdate = await request(app)
      .patch(`/api/admin/users/${customerId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "technician" });
    expect(roleUpdate.status).toBe(200);
    expect(roleUpdate.body.data.role).toBe("technician");

    const profileRes = await request(app)
      .patch("/api/users/profile")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        name: "Bob Vance Updated",
        phone: "+1 555-888-9999",
        area: "North Austin",
        bio: "Micro-soldering specialist",
      });
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.name).toBe("Bob Vance Updated");
  });

  it("upgrades technician to Pro via verified Stripe $50 session idempotently and unlocks unlimited services", async () => {
    const proSession = {
      id: "cs_test_pro_upgrade_001",
      payment_status: "paid",
      payment_intent: "pi_test_pro_upgrade_001",
      metadata: {
        type: "pro_upgrade",
        technicianEmail: "bob@fixmate.app",
        technicianName: "Bob Vance Updated",
      },
    } as never;

    const u1 = await finalizeProUpgradeFromSession(proSession);
    const u2 = await finalizeProUpgradeFromSession(proSession);
    expect(u1.plan).toBe("pro");
    expect(u1.payment.amount).toBe(50);
    expect(String(u1.payment._id)).toBe(String(u2.payment._id));

    // Previously blocked 4th service now succeeds
    const create4 = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        title: "Laptop Thermal Service Pro",
        category: "Laptop & PC",
        description:
          "Complete laptop heatsink cleaning and thermal compound replacement.",
        image: "https://i.ibb.co/demo/laptop.jpg",
        basePrice: 85,
        estimatedDuration: "1.5 hours",
        serviceMode: "Shop Drop-off",
        serviceArea: "Austin, TX",
      });
    expect(create4.status).toBe(201);
  });
});
