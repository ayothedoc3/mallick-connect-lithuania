import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/checkout/feature")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { jsonHandler } = await import("@/server/admin");
        const { startFeatureCheckout } = await import("@/server/payments");
        return jsonHandler(() => startFeatureCheckout(request));
      },
    },
  },
});
