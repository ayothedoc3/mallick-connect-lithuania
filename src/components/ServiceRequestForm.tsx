import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { SERVICES } from "@/lib/site";
import { useSiteSettings, useWaLink } from "@/lib/settings";
import { submitServiceRequest } from "@/lib/requests";

interface Props {
  defaultService?: string;
  title?: string;
}

export function ServiceRequestForm({ defaultService = "", title = "Request a service" }: Props) {
  const site = useSiteSettings();
  const waLink = useWaLink();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    service: defaultService,
    message: "",
  });

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      `*New Service Request: Mallick Assist*`,
      ``,
      `*Name:* ${form.name}`,
      `*WhatsApp:* ${form.whatsapp}`,
      `*Service:* ${form.service}`,
      ``,
      `*Message:*`,
      form.message,
    ].join("\n");
    // Open WhatsApp first: browsers only allow pop-ups directly inside the click.
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    setSubmitted(true);
    submitServiceRequest(form).catch((err) => {
      console.error(err);
      toast.error("Your request could not be saved. Please also message us on WhatsApp.");
    });
  }

  const inputCls =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

  return (
    <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border">
      <h3 className="font-display text-2xl font-extrabold text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We'll open WhatsApp with your details filled in, so we can reply straight away.
      </p>

      {submitted ? (
        <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm">
          <p className="font-semibold text-primary">Thanks! Opening WhatsApp…</p>
          <p className="mt-1 text-muted-foreground">
            If your chat didn't open, message us directly at <strong>{site.phone_display}</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input
              required
              value={form.name}
              onChange={update("name")}
              className={inputCls}
              placeholder="Your name"
            />
          </Field>
          <Field label="WhatsApp number" required>
            <input
              required
              value={form.whatsapp}
              onChange={update("whatsapp")}
              className={inputCls}
              placeholder="+370…"
            />
          </Field>
          <Field label="Service" required className="sm:col-span-2">
            <select required value={form.service} onChange={update("service")} className={inputCls}>
              <option value="">Select a service…</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Message" className="sm:col-span-2">
            <textarea
              rows={4}
              value={form.message}
              onChange={update("message")}
              className={inputCls}
              placeholder="What do you need, where and when? A budget helps too."
            />
          </Field>
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright transition shadow-soft"
            >
              <Send className="size-4" /> Send on WhatsApp
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-primary">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
