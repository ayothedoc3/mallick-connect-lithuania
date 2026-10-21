import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";
import { useSiteSettings } from "@/lib/settings";

export const LEGAL_UPDATED = "21 October 2026";

/** Who runs the site, as filled in under /precious → Site settings → Legal details. */
export function Operator() {
  const s = useSiteSettings();
  return (
    <>
      <strong>{s.legal_name}</strong>
      {s.company_code && <>, registration number {s.company_code}</>}
      {s.legal_address && <>, {s.legal_address}</>}
    </>
  );
}

export function ContactLine() {
  const s = useSiteSettings();
  return (
    <>
      {s.contact_email ? (
        <>
          email <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a> or{" "}
        </>
      ) : null}
      message us on WhatsApp at {s.phone_display}
    </>
  );
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={title} title={title} subtitle={`Last updated ${LEGAL_UPDATED}`} />
      <article className="legal mx-auto max-w-3xl px-4 sm:px-6 py-14 text-[15px] leading-relaxed text-foreground/90 [&_a]:font-semibold [&_a]:text-primary-bright [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-primary [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </article>
    </>
  );
}
