import type { Request, Response } from "express";
import type Stripe from "stripe";
import { env } from "../config/env.js";
import { getStripe } from "../config/stripe.js";
import { finalizePaidBookingFromSession } from "../services/payment.service.js";

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Missing stripe-signature header." });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return res
      .status(500)
      .json({ error: "STRIPE_WEBHOOK_SECRET is not configured." });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid webhook signature.";
    console.error("[Stripe Webhook Signature Error]:", message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await finalizePaidBookingFromSession(session);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook Processing Error]:", err);
    return res.status(500).json({ error: "Webhook processing failed." });
  }
}
