import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/settings";
import { CONSENT_KEY, type Consent } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadGoogleAnalytics(id: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/**
 * Google Analytics 4, loaded only after the visitor accepts (EU/GDPR).
 * Page views on client-side navigation are tracked by GA4's enhanced measurement.
 */
export function Analytics() {
  const { ga_measurement_id: id } = useSiteSettings();
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    setConsent(localStorage.getItem(CONSENT_KEY) as Consent | null);
  }, []);

  useEffect(() => {
    if (id && consent === "granted") loadGoogleAnalytics(id);
  }, [id, consent]);

  function choose(value: Consent) {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  // undefined = not read yet (server render); only ask when analytics is switched on.
  if (!id || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-card sm:flex-row sm:items-center"
    >
      <p className="flex-1 text-muted-foreground">
        We use Google Analytics cookies to understand how visitors use our site. No ads, and you can
        say no.
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => choose("denied")}
          className="rounded-full border border-input px-4 py-2 font-semibold hover:border-primary-bright"
        >
          No thanks
        </button>
        <button
          onClick={() => choose("granted")}
          className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary-bright"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
