import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/checkout/booking")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { jsonHandler } = await import("@/server/admin");
        const { startBookingCheckout } = await import("@/server/payments");
        return jsonHandler(() => startBookingCheckout(request));
      },
    },
  },
});
