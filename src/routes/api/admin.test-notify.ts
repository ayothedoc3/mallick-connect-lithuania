import { createFileRoute } from "@tanstack/react-router";

// "Send test" in /precious → Integrations.
export const Route = createFileRoute("/api/admin/test-notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { jsonHandler, requireAdmin, getPrivateSettings } = await import("@/server/admin");
        const { sendEmail, sendTelegram } = await import("@/server/messaging");
        return jsonHandler(async () => {
          const user = await requireAdmin(request);
          const s = await getPrivateSettings();
          const message = {
            subject: "Mallick test notification",
            lines: ["Notifications are working", `Sent from /precious by ${user.email}.`],
          };
          const results: Record<string, string> = {};
          for (const [name, run, ready] of [
            [
              "email",
              () =>
                sendEmail(
                  s,
                  s.notify_emails
                    .split(",")
                    .map((e) => e.trim())
                    .filter(Boolean),
                  message,
                ),
              Boolean(s.resend_api_key && s.notify_emails),
            ],
            [
              "telegram",
              () => sendTelegram(s, message),
              Boolean(s.telegram_bot_token && s.telegram_chat_id),
            ],
          ] as const) {
            if (!ready) {
              results[name] = "not set up";
              continue;
            }
            try {
              await run();
              results[name] = "sent";
            } catch (err) {
              results[name] = err instanceof Error ? err.message : "failed";
            }
          }
          return results;
        });
      },
    },
  },
});
