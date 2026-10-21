import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError, SUPABASE_URL, getPrivateSettings } from "./admin";
import { sendEmail, type Message } from "./messaging";

interface HookPayload {
  user: { email: string };
  email_data: { token_hash: string; redirect_to: string; email_action_type: string };
}

/** Standard Webhooks signature check (what the sign-in service uses for hooks). */
function verify(secret: string, request: Request, body: string) {
  const id = request.headers.get("webhook-id");
  const timestamp = request.headers.get("webhook-timestamp");
  const signatures = request.headers.get("webhook-signature");
  if (!id || !timestamp || !signatures) throw new HttpError(401, "Missing signature.");
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300)
    throw new HttpError(401, "Stale request.");
  const key = Buffer.from(secret.replace(/^v1,whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  const ok = signatures
    .split(" ")
    .map((s) => Buffer.from(s.split(",")[1] ?? "", "base64"))
    .some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
  if (!ok) throw new HttpError(401, "Bad signature.");
}

const MESSAGES: Record<string, (link: string) => Message> = {
  recovery: (link) => ({
    subject: "Reset your Mallick Assist Service password",
    lines: [
      "Reset your password",
      "Tap the button to choose a new password. The link works once and expires in 1 hour.",
      "If you didn't ask for this, you can ignore this email.",
    ],
    link: { label: "Choose a new password", url: link },
  }),
  signup: (link) => ({
    subject: "Confirm your Mallick Assist Service account",
    lines: ["Confirm your email", "Tap the button to finish creating your account."],
    link: { label: "Confirm my email", url: link },
  }),
  magiclink: (link) => ({
    subject: "Your Mallick Assist Service sign-in link",
    lines: ["Sign in to Mallick Assist Service", "This link works once and expires in 1 hour."],
    link: { label: "Sign in", url: link },
  }),
  invite: (link) => ({
    subject: "You're invited to Mallick Assist Service",
    lines: ["You've been invited", "Tap the button to set up your account."],
    link: { label: "Accept invite", url: link },
  }),
};

export async function handleAuthEmail(request: Request) {
  const s = await getPrivateSettings();
  const body = await request.text();
  verify(s.auth_hook_secret, request, body);
  const { user, email_data } = JSON.parse(body) as HookPayload;
  const make = MESSAGES[email_data.email_action_type];
  if (!make) throw new HttpError(400, `Unsupported email type ${email_data.email_action_type}`);
  if (!s.resend_api_key)
    throw new HttpError(503, "Email isn't set up yet. Please message us on WhatsApp.");
  const link =
    `${SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(email_data.token_hash)}` +
    `&type=${encodeURIComponent(email_data.email_action_type)}` +
    `&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;
  await sendEmail(s, [user.email], make(link));
  return {};
}
