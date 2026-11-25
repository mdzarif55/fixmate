import Stripe from "stripe";
import { env } from "./env.js";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}
