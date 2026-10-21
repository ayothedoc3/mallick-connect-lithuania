import { createFileRoute } from "@tanstack/react-router";

// Stripe → Developers → Webhooks: send checkout.session.completed and
// checkout.session.expired to https://mallickassistservice.com/api/stripe/webhook
export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { jsonHandler } = await import("@/server/admin");
        const { handleStripeWebhook } = await import("@/server/payments");
        return jsonHandler(() => handleStripeWebhook(request));
      },
    },
  },
});
