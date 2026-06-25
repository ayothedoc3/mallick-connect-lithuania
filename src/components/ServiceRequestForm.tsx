import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { SERVICES, waLink } from "@/lib/site";

interface Props {
  defaultService?: string;
  title?: string;
}

export function ServiceRequestForm({ defaultService = "", title = "Request a Service" }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    service: defaultService,
    city: "",
    budget: "",
    date: "",
    message: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      `*New Service Request: Mallick Assist*`,
      ``,
      `*Name:* ${form.name}`,
      `*WhatsApp:* ${form.whatsapp}`,
      `*Email:* ${form.email}`,
      `*Service:* ${form.service}`,
      `*City:* ${form.city}`,
      `*Budget:* ${form.budget}`,
      `*Preferred date:* ${form.date}`,
      ``,
      `*Message:*`,
      form.message,
    ].join("\n");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  const inputCls =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

  return (
    <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border">
      <h3 className="font-display text-2xl font-extrabold text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Fill out the form and we'll continue the conversation on WhatsApp.
      </p>

      {submitted ? (
        <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm">
          <p className="font-semibold text-primary">Thanks! Opening WhatsApp…</p>
          <p className="mt-1 text-muted-foreground">
            If your chat didn't open, message us directly at <strong>+370 624 34541</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input required value={form.name} onChange={update("name")} className={inputCls} placeholder="Your name" />
          </Field>
          <Field label="WhatsApp number" required>
            <input required value={form.whatsapp} onChange={update("whatsapp")} className={inputCls} placeholder="+370…" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={update("email")} className={inputCls} placeholder="you@email.com" />
          </Field>
          <Field label="Service" required>
            <select required value={form.service} onChange={update("service")} className={inputCls}>
              <option value="">Select a service…</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.title}>{s.title}</option>
              ))}
            </select>
          </Field>
          <Field label="City">
            <input value={form.city} onChange={update("city")} className={inputCls} placeholder="Vilnius, Kaunas…" />
          </Field>
          <Field label="Budget (EUR)">
            <input value={form.budget} onChange={update("budget")} className={inputCls} placeholder="e.g. 300" />
          </Field>
          <Field label="Preferred date" className="sm:col-span-2">
            <input type="date" value={form.date} onChange={update("date")} className={inputCls} />
          </Field>
          <Field label="Message" className="sm:col-span-2">
            <textarea
              rows={4}
              value={form.message}
              onChange={update("message")}
              className={inputCls}
              placeholder="Tell us what you need…"
            />
          </Field>
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright transition shadow-soft"
            >
              <Send className="size-4" /> Send Request
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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
