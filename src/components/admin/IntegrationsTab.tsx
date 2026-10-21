import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Integrations {
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  resend_api_key: string;
  email_from: string;
  notify_emails: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
}
type Key = keyof Integrations;

const SECRET_KEYS: Key[] = [
  "stripe_secret_key",
  "stripe_webhook_secret",
  "resend_api_key",
  "telegram_bot_token",
];
const COLUMNS =
  "stripe_secret_key, stripe_webhook_secret, resend_api_key, email_from, notify_emails, telegram_bot_token, telegram_chat_id";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

const mask = (v: string) => (v ? `Saved, ends in …${v.slice(-4)}` : "Not set");

async function fetchIntegrations(): Promise<Integrations> {
  const { data, error } = await supabase
    .from("private_settings")
    .select(COLUMNS)
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as Integrations;
}

export function IntegrationsTab() {
  const q = useQuery({ queryKey: ["admin", "integrations"], queryFn: fetchIntegrations });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (q.error) return <p className="text-sm text-destructive">{(q.error as Error).message}</p>;
  return <IntegrationsForm current={q.data!} />;
}

function IntegrationsForm({ current }: { current: Integrations }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  // Secrets start empty: typing a new value replaces the saved one, empty keeps it.
  const [form, setForm] = useState<Integrations>({
    ...current,
    ...Object.fromEntries(SECRET_KEYS.map((k) => [k, ""])),
  });
  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: async () => {
      const update: Partial<Integrations> = {
        email_from: form.email_from.trim(),
        notify_emails: form.notify_emails.trim(),
        telegram_chat_id: form.telegram_chat_id.trim(),
      };
      for (const k of SECRET_KEYS) if (form[k].trim()) update[k] = form[k].trim();
      const { error } = await supabase.from("private_settings").update(update).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] });
      await router.invalidate();
      setForm((f) => ({ ...f, ...Object.fromEntries(SECRET_KEYS.map((k) => [k, ""])) }));
      toast.success("Integrations saved.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const clear = useMutation({
    mutationFn: async (k: Key) => {
      const { error } = await supabase
        .from("private_settings")
        .update({ [k]: "" })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] });
      await router.invalidate();
      toast.success("Removed.");
    },
  });

  const test = useMutation({
    mutationFn: async () => {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/test-notify", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      return body as Record<string, string>;
    },
    onSuccess: (r) => toast.message(`Email: ${r.email}. Telegram: ${r.telegram}.`),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Test failed."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  const secret = (k: Key, label: string, hint: string, placeholder: string) => (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-semibold text-primary">
        {label}
        <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
          {current[k] ? (
            <CheckCircle2 className="size-3.5 text-whatsapp" />
          ) : (
            <CircleDashed className="size-3.5" />
          )}
          {mask(current[k])}
          {current[k] && (
            <button type="button" onClick={() => clear.mutate(k)} className="ml-1 underline">
              Remove
            </button>
          )}
        </span>
      </span>
      <input
        type="password"
        autoComplete="off"
        value={form[k]}
        onChange={set(k)}
        placeholder={current[k] ? "Paste a new value to replace it" : placeholder}
        className={inputCls}
      />
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
    </label>
  );

  const stripeOn = Boolean(current.stripe_secret_key && current.stripe_webhook_secret);

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Stripe payments
        </legend>
        <p className="text-sm text-muted-foreground">
          Booking deposits and paid "Featured" listings. Online payment buttons appear on the site
          only when both keys are saved.{" "}
          <strong className={stripeOn ? "text-whatsapp" : "text-primary"}>
            {stripeOn ? "Payments are on." : "Payments are off."}
          </strong>
        </p>
        <div className="mt-4 grid gap-4">
          {secret(
            "stripe_secret_key",
            "Secret key",
            "Stripe → Developers → API keys → Secret key. Use sk_test_… to test, sk_live_… to go live.",
            "sk_live_…",
          )}
          {secret(
            "stripe_webhook_secret",
            "Webhook signing secret",
            "Stripe → Developers → Webhooks → Add endpoint, then copy its signing secret.",
            "whsec_…",
          )}
          <div className="rounded-2xl bg-secondary/70 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-primary">Webhook endpoint to add in Stripe</p>
            <p className="mt-1 break-all font-mono">
              https://mallickassistservice.com/api/stripe/webhook
            </p>
            <p className="mt-2">
              Events: <span className="font-mono">checkout.session.completed</span> and{" "}
              <span className="font-mono">checkout.session.expired</span>
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Email (Resend)
        </legend>
        <p className="text-sm text-muted-foreground">
          Password reset emails, "your listing is live" emails, booking confirmations and team
          alerts.
        </p>
        <div className="mt-4 grid gap-4">
          {secret(
            "resend_api_key",
            "Resend API key",
            "resend.com → API Keys → Create API key.",
            "re_…",
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">Send from</span>
            <input
              required
              value={form.email_from}
              onChange={set("email_from")}
              className={inputCls}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Must use a domain verified in Resend, e.g. Mallick Assist Service
              &lt;hello@mallickassistservice.com&gt;
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">
              Team alert emails
            </span>
            <input
              value={form.notify_emails}
              onChange={set("notify_emails")}
              className={inputCls}
              placeholder="precious@example.com, ayo@example.com"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Who gets new listing, request, review and booking alerts. Separate with commas.
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Telegram alerts
        </legend>
        <p className="text-sm text-muted-foreground">
          Instant alerts on your phone. In Telegram, message @BotFather, send /newbot and copy the
          token. Then send your new bot any message and open
          api.telegram.org/bot&lt;token&gt;/getUpdates to find your chat ID.
        </p>
        <div className="mt-4 grid gap-4">
          {secret("telegram_bot_token", "Bot token", "From @BotFather.", "123456:ABC…")}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">Chat ID</span>
            <input
              value={form.telegram_chat_id}
              onChange={set("telegram_chat_id")}
              className={inputCls}
              placeholder="e.g. 123456789"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              A person or group chat. For a group, add the bot to the group first.
            </span>
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-start gap-3 lg:col-span-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary-bright disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save integrations"}
        </button>
        <button
          type="button"
          onClick={() => test.mutate()}
          disabled={test.isPending}
          className="rounded-full border border-input px-6 py-3.5 text-sm font-semibold hover:border-primary-bright disabled:opacity-60"
        >
          {test.isPending ? "Sending…" : "Send a test alert"}
        </button>
      </div>
    </form>
  );
}
