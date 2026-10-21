import { createFileRoute } from "@tanstack/react-router";

// Called by the database (private.notify) when something needs the team's attention.
export const Route = createFileRoute("/api/hooks/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { jsonHandler } = await import("@/server/admin");
        const { handleDbEvent } = await import("@/server/events");
        return jsonHandler(() => handleDbEvent(request));
      },
    },
  },
});
