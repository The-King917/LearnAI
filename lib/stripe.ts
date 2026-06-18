import Stripe from "stripe";

let _stripe: Stripe | undefined;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");
    return _stripe[prop as keyof Stripe];
  },
});
