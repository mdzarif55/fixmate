import { ObjectId } from "mongodb";
import type Stripe from "stripe";
import { env } from "../config/env.js";
import { getStripe } from "../config/stripe.js";
import {
  bookingsCollection,
  paymentsCollection,
  servicesCollection,
  usersCollection,
} from "../database/mongo.js";
import type { AuthenticatedUser, PaymentDoc } from "../types/index.js";
import { PRO_PLAN_PRICE_USD } from "../utils/constants.js";
import { AppError } from "../utils/responses.js";

export async function createCheckoutSessionForBooking(
  customer: AuthenticatedUser,
  bookingId: string
) {
  if (!ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID.", 400);
  }

  const booking = await bookingsCollection().findOne({
    _id: new ObjectId(bookingId),
  });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }
  if (booking.customerEmail !== customer.email) {
    throw new AppError(
      "Forbidden: You can only pay for your own bookings.",
      403
    );
  }
  if (booking.status !== "completed") {
    throw new AppError(
      "Payment is only allowed after the repair job is completed.",
      400
    );
  }
  if (booking.paymentStatus === "paid") {
    throw new AppError("This booking has already been paid.", 400);
  }

  const existingPayment = await paymentsCollection().findOne({ bookingId });
  if (existingPayment) {
    throw new AppError("A payment record already exists for this booking.", 409);
  }

  if (typeof booking.finalAmount !== "number" || booking.finalAmount <= 0) {
    throw new AppError("Invalid final repair amount.", 400);
  }

  const stripe = getStripe();
  const unitAmountCents = Math.round(booking.finalAmount * 100);
  const clientBase = env.CLIENT_URL.replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customer.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.serviceTitle,
            description: `FixMate repair by ${booking.technicianName}`,
          },
          unit_amount: unitAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: String(booking._id),
      customerEmail: customer.email,
    },
    success_url: `${clientBase}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientBase}/payment/cancel?booking_id=${String(booking._id)}`,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function finalizePaidBookingFromSession(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") {
    throw new AppError("Stripe checkout session is not paid yet.", 400);
  }

  const bookingId = session.metadata?.bookingId;
  const customerEmail = session.metadata?.customerEmail;

  if (!bookingId || !ObjectId.isValid(bookingId)) {
    throw new AppError("Missing or invalid booking metadata on session.", 400);
  }

  const payments = paymentsCollection();
  const bookings = bookingsCollection();

  // Idempotency check by stripeSessionId or bookingId
  const existing = await payments.findOne({
    $or: [{ stripeSessionId: session.id }, { bookingId }],
  });

  const booking = await bookings.findOne({ _id: new ObjectId(bookingId) });
  if (!booking) {
    throw new AppError("Associated booking not found.", 404);
  }

  if (customerEmail && booking.customerEmail !== customerEmail) {
    throw new AppError("Booking ownership mismatch in payment metadata.", 403);
  }

  const now = new Date();

  if (existing) {
    if (booking.paymentStatus !== "paid") {
      await bookings.updateOne(
        { _id: booking._id },
        {
          $set: { paymentStatus: "paid", updatedAt: now },
          $push: { statusHistory: { status: "paid", changedAt: now } },
        }
      );
    }
    const updatedBooking = await bookings.findOne({ _id: booking._id });
    return { payment: existing, booking: updatedBooking };
  }

  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  const paymentDoc: Omit<PaymentDoc, "_id"> = {
    bookingId,
    serviceTitle: booking.serviceTitle,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    technicianName: booking.technicianName,
    technicianEmail: booking.technicianEmail,
    amount: booking.finalAmount,
    currency: "USD",
    transactionId,
    stripeSessionId: session.id,
    paymentStatus: "paid",
    paidAt: now,
  };

  let insertedPayment: PaymentDoc;
  try {
    const insertRes = await payments.insertOne(paymentDoc as PaymentDoc);
    insertedPayment = { _id: insertRes.insertedId, ...paymentDoc };
  } catch (err) {
    // Handle concurrent webhook + success page verification race cleanly
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      const concurrent = await payments.findOne({
        $or: [{ stripeSessionId: session.id }, { bookingId }],
      });
      if (concurrent) {
        const updatedBooking = await bookings.findOne({ _id: booking._id });
        return { payment: concurrent, booking: updatedBooking };
      }
    }
    throw err;
  }

  const hasPaidHistory = booking.statusHistory?.some(
    (entry) => entry.status === "paid"
  );

  await bookings.updateOne(
    { _id: booking._id },
    {
      $set: { paymentStatus: "paid", updatedAt: now },
      ...(hasPaidHistory
        ? {}
        : { $push: { statusHistory: { status: "paid", changedAt: now } } }),
    }
  );

  const updatedBooking = await bookings.findOne({ _id: booking._id });
  return { payment: insertedPayment, booking: updatedBooking };
}

export async function verifyStripeSessionForCustomer(
  sessionId: string,
  customerEmail: string
) {
  if (!sessionId) {
    throw new AppError("Session ID is required.", 400);
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.metadata?.customerEmail &&
    session.metadata.customerEmail !== customerEmail
  ) {
    throw new AppError(
      "Forbidden: This payment session does not belong to you.",
      403
    );
  }

  return finalizePaidBookingFromSession(session);
}

export async function listCustomerPayments(customerEmail: string) {
  return paymentsCollection()
    .find({ customerEmail })
    .sort({ paidAt: -1 })
    .toArray();
}

export async function createProUpgradeCheckoutSession(
  technician: AuthenticatedUser
) {
  if (technician.plan === "pro") {
    throw new AppError("You are already on the FixMate Pro plan.", 400);
  }

  const stripe = getStripe();
  const unitAmountCents = Math.round(PRO_PLAN_PRICE_USD * 100);
  const clientBase = env.CLIENT_URL.replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: technician.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "FixMate Pro Technician Plan",
            description:
              "Unlimited service listings and Verified Pro technician badge",
          },
          unit_amount: unitAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "pro_upgrade",
      userId: technician.id,
      technicianEmail: technician.email,
      technicianName: technician.name,
    },
    success_url: `${clientBase}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=pro_upgrade`,
    cancel_url: `${clientBase}/payment/cancel?type=pro_upgrade`,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function finalizeProUpgradeFromSession(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") {
    throw new AppError("Stripe checkout session is not paid yet.", 400);
  }

  const technicianEmail = session.metadata?.technicianEmail?.toLowerCase();
  const technicianName =
    session.metadata?.technicianName || "FixMate Technician";
  if (!technicianEmail) {
    throw new AppError("Missing technician metadata on Stripe session.", 400);
  }

  const users = usersCollection();
  const technician = await users.findOne({ email: technicianEmail });
  if (!technician) {
    throw new AppError("Technician account not found.", 404);
  }

  const upgradeBookingKey = `pro_upgrade_${technicianEmail}`;
  const payments = paymentsCollection();
  const existing = await payments.findOne({
    $or: [{ stripeSessionId: session.id }, { bookingId: upgradeBookingKey }],
  });

  const now = new Date();

  if (technician.plan !== "pro") {
    await users.updateOne(
      { _id: technician._id },
      { $set: { plan: "pro", updatedAt: now } }
    );
  }

  await servicesCollection().updateMany(
    { technicianEmail },
    { $set: { technicianIsPro: true, updatedAt: now } }
  );

  if (existing) {
    return { payment: existing, plan: "pro" as const };
  }

  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  const paymentDoc: Omit<PaymentDoc, "_id"> = {
    bookingId: upgradeBookingKey,
    serviceTitle: "FixMate Pro Technician Plan",
    customerName: technician.name || technicianName,
    customerEmail: technicianEmail,
    technicianName: technician.name || technicianName,
    technicianEmail,
    amount: PRO_PLAN_PRICE_USD,
    currency: "USD",
    transactionId,
    stripeSessionId: session.id,
    paymentStatus: "paid",
    paidAt: now,
  };

  try {
    const insertRes = await payments.insertOne(paymentDoc as PaymentDoc);
    return {
      payment: { _id: insertRes.insertedId, ...paymentDoc },
      plan: "pro" as const,
    };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      const concurrent = await payments.findOne({
        $or: [{ stripeSessionId: session.id }, { bookingId: upgradeBookingKey }],
      });
      if (concurrent) {
        return { payment: concurrent, plan: "pro" as const };
      }
    }
    throw err;
  }
}

export async function verifyProUpgradeSessionForTechnician(
  sessionId: string,
  technicianEmail: string
) {
  if (!sessionId) {
    throw new AppError("Session ID is required.", 400);
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.metadata?.type !== "pro_upgrade" ||
    session.metadata?.technicianEmail?.toLowerCase() !==
      technicianEmail.toLowerCase()
  ) {
    throw new AppError(
      "Forbidden: This Pro upgrade session does not belong to you.",
      403
    );
  }

  return finalizeProUpgradeFromSession(session);
}
