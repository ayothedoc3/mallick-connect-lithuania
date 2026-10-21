import { createFileRoute } from "@tanstack/react-router";

// Called by the sign-in service to send password reset and other account emails.
export const Route = createFileRoute("/api/hooks/auth-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { HttpError } = await import("@/server/admin");
        const { handleAuthEmail } = await import("@/server/authEmail");
        try {
          return Response.json(await handleAuthEmail(request));
        } catch (err) {
          const status = err instanceof HttpError ? err.status : 500;
          if (status === 500) console.error(err);
          const message = err instanceof Error ? err.message : "Email failed.";
          // The sign-in service expects this error shape from hooks.
          return Response.json({ error: { http_code: status, message } }, { status });
        }
      },
    },
  },
});
