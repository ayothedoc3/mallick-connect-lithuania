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
