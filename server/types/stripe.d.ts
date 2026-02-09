/**
 * Ambient type declarations for the optional `stripe` package.
 *
 * The stripe package is loaded dynamically at runtime via `require("stripe")`.
 * These minimal declarations keep TypeScript happy without requiring the
 * package to be installed.
 */

declare module "stripe" {
  namespace Stripe {
    type LatestApiVersion = string;

    interface Checkout {
      Session: {
        id: string;
        url: string | null;
        status: string | null;
        payment_status: string;
        amount_total: number | null;
        customer_email: string | null;
        metadata: Record<string, string> | null;
      };
    }

    namespace Checkout {
      type Session = Stripe.Checkout["Session"];
    }

    interface Event {
      type: string;
      data: {
        object: unknown;
      };
    }

    interface Refund {
      id: string;
      status: string | null;
      amount: number;
    }
  }

  interface Stripe {
    checkout: {
      sessions: {
        create(params: Record<string, unknown>): Promise<Stripe.Checkout.Session>;
        retrieve(id: string): Promise<Stripe.Checkout.Session>;
      };
    };
    webhooks: {
      constructEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event;
    };
    refunds: {
      create(params: Record<string, unknown>): Promise<Stripe.Refund>;
    };
  }

  class Stripe {
    constructor(apiKey: string, config?: { apiVersion?: string });
  }

  export = Stripe;
  export default Stripe;
}
