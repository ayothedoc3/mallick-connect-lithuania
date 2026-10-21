import { escapeHtml, getPrivateSettings, type PrivateSettings } from "./admin";

export interface Message {
  subject: string;
  /** Plain lines; the first is the headline. */
  lines: string[];
  link?: { label: string; url: string };
}

function emailHtml(m: Message) {
  const [head, ...rest] = m.lines;
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p style="font-size:17px;font-weight:bold">${escapeHtml(head)}</p>
${rest.map((l) => `<p style="margin:4px 0">${escapeHtml(l)}</p>`).join("\n")}
${m.link ? `<p style="margin-top:20px"><a href="${escapeHtml(m.link.url)}" style="background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${escapeHtml(m.link.label)}</a></p>` : ""}
<p style="margin-top:28px;color:#777;font-size:12px">Mallick Assist Service, Vilnius</p></div>`;
}

export async function sendEmail(s: PrivateSettings, to: string[], m: Message) {
  if (!s.resend_api_key || to.length === 0) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${s.resend_api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: s.email_from, to, subject: m.subject, html: emailHtml(m) }),
  });
  if (!res.ok) throw new Error(`Email failed (${res.status}): ${await res.text()}`);
}

export async function sendTelegram(s: PrivateSettings, m: Message) {
  if (!s.telegram_bot_token || !s.telegram_chat_id) return;
  const text = [
    `<b>${escapeHtml(m.lines[0])}</b>`,
    ...m.lines.slice(1).map(escapeHtml),
    m.link ? `\n<a href="${escapeHtml(m.link.url)}">${escapeHtml(m.link.label)}</a>` : "",
  ].join("\n");
  const res = await fetch(`https://api.telegram.org/bot${s.telegram_bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: s.telegram_chat_id, text, parse_mode: "HTML" }),
  });
  if (!res.ok) throw new Error(`Telegram failed (${res.status}): ${await res.text()}`);
}

const staffEmails = (s: PrivateSettings) =>
  s.notify_emails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

/** Email + Telegram to the team. Channels that aren't set up in Integrations are skipped. */
export async function notifyStaff(m: Message, settings?: PrivateSettings) {
  const s = settings ?? (await getPrivateSettings());
  await Promise.all([sendEmail(s, staffEmails(s), m), sendTelegram(s, m)]);
}
