import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateSiteSettings, useSiteSettings, type SiteSettings } from "@/lib/settings";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

export function SettingsTab() {
  const current = useSiteSettings();
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(current);

  const save = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: async () => {
      await router.invalidate();
      toast.success("Site updated.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save the settings."),
  });

  const set =
    (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate({
      ...form,
      phone: form.phone.trim(),
      phone_display: form.phone_display.trim(),
      city: form.city.trim(),
      tiktok_url: form.tiktok_url.trim(),
      tiktok_handle: form.tiktok_handle.trim(),
      banner_text: form.banner_text.trim(),
      ga_measurement_id: form.ga_measurement_id.trim().toUpperCase(),
      feature_price_eur: Number(form.feature_price_eur),
      feature_days: Number(form.feature_days),
      legal_name: form.legal_name.trim(),
      company_code: form.company_code.trim(),
      legal_address: form.legal_address.trim(),
      contact_email: form.contact_email.trim(),
      booking_terms: form.booking_terms.trim(),
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Contact details
        </legend>
        <p className="text-sm text-muted-foreground">
          Shown in the footer, contact page and every WhatsApp button.
        </p>
        <div className="mt-4 grid gap-4">
          <Field
            label="WhatsApp / phone number"
            hint="International format, used for calls and WhatsApp links. E.g. +37062434541"
          >
            <input
              required
              pattern="\+[0-9 ]{7,20}"
              value={form.phone}
              onChange={set("phone")}
              className={inputCls}
              inputMode="tel"
            />
          </Field>
          <Field
            label="Number as displayed"
            hint="How the number is written on the site. E.g. +370 624 34541"
          >
            <input
              required
              value={form.phone_display}
              onChange={set("phone_display")}
              className={inputCls}
            />
          </Field>
          <Field label="City">
            <input required value={form.city} onChange={set("city")} className={inputCls} />
          </Field>
          <Field label="TikTok link">
            <input
              required
              type="url"
              value={form.tiktok_url}
              onChange={set("tiktok_url")}
              className={inputCls}
            />
          </Field>
          <Field label="TikTok handle">
            <input
              required
              value={form.tiktok_handle}
              onChange={set("tiktok_handle")}
              className={inputCls}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Announcement banner
        </legend>
        <p className="text-sm text-muted-foreground">A message bar across the top of every page.</p>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.banner_enabled}
            onChange={(e) => setForm((f) => ({ ...f, banner_enabled: e.target.checked }))}
            className="size-5 accent-primary"
          />
          Show the banner
        </label>
        <div className="mt-4">
          <Field label="Banner message">
            <textarea
              rows={3}
              maxLength={200}
              required={form.banner_enabled}
              value={form.banner_text}
              onChange={set("banner_text")}
              className={inputCls}
              placeholder="e.g. New rooms available in Vilnius from 1 November. Message us on WhatsApp!"
            />
          </Field>
        </div>
        {form.banner_enabled && form.banner_text.trim() && (
          <div className="mt-4 rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">
            {form.banner_text}
          </div>
        )}
      </fieldset>

      <fieldset className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Featured listings
        </legend>
        <p className="text-sm text-muted-foreground">
          What sellers and providers pay to show their listing first, with a "Featured" badge.
          Needs Stripe in Integrations.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Price (EUR)">
            <input required type="number" min={1} step="0.5" value={form.feature_price_eur} onChange={set("feature_price_eur")} className={inputCls} />
          </Field>
          <Field label="For how many days">
            <input required type="number" min={1} max={90} value={form.feature_days} onChange={set("feature_days")} className={inputCls} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Legal details
        </legend>
        <p className="text-sm text-muted-foreground">
          Shown on the privacy policy, terms and cookie pages. Fill in exactly as registered.
        </p>
        <div className="mt-4 grid gap-4">
          <Field label="Legal name" hint="Company or person running Mallick Assist Service.">
            <input required value={form.legal_name} onChange={set("legal_name")} className={inputCls} />
          </Field>
          <Field label="Company or activity code" hint="Įmonės kodas or individual activity certificate number (company or activity registration number).">
            <input value={form.company_code} onChange={set("company_code")} className={inputCls} />
          </Field>
          <Field label="Registered address">
            <input value={form.legal_address} onChange={set("legal_address")} className={inputCls} />
          </Field>
          <Field label="Contact email for privacy questions">
            <input type="email" value={form.contact_email} onChange={set("contact_email")} className={inputCls} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Booking terms
        </legend>
        <p className="text-sm text-muted-foreground">
          Shown next to the booking form and in the terms. Say when deposits are refunded.
        </p>
        <div className="mt-4">
          <Field label="Deposit and cancellation terms">
            <textarea required rows={5} maxLength={1500} value={form.booking_terms} onChange={set("booking_terms")} className={inputCls} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
        <legend className="px-2 font-display text-lg font-extrabold text-primary">
          Google Analytics
        </legend>
        <p className="text-sm text-muted-foreground">
          Paste your GA4 Measurement ID to start tracking visitors. Leave it empty to switch
          analytics off. Visitors are asked for cookie consent first, as EU law requires.
        </p>
        <div className="mt-4">
          <Field
            label="Measurement ID"
            hint="Google Analytics → Admin → Data streams → your website stream. Looks like G-ABC123XYZ."
          >
            <input
              value={form.ga_measurement_id}
              onChange={set("ga_measurement_id")}
              pattern="[Gg]-[A-Za-z0-9]{4,20}"
              placeholder="G-XXXXXXXXXX"
              className={inputCls}
            />
          </Field>
        </div>
      </fieldset>

      <div className="lg:col-span-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary-bright disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
