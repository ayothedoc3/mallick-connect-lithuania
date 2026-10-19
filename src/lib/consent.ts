export const CONSENT_KEY = "mallick-analytics-consent";
export type Consent = "granted" | "denied";

/** Forget the visitor's choice so the consent bar shows again (and GA stops after reload). */
export function resetCookieConsent() {
  localStorage.removeItem(CONSENT_KEY);
  window.location.reload();
}
