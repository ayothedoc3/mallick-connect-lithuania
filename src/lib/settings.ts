import { useLoaderData } from "@tanstack/react-router";
import { supabase } from "./supabase";

export interface SiteSettings {
  phone: string;
  phone_display: string;
  city: string;
  tiktok_url: string;
  tiktok_handle: string;
  banner_enabled: boolean;
  banner_text: string;
  ga_measurement_id: string;
  payments_enabled: boolean;
  feature_price_eur: number;
  feature_days: number;
  legal_name: string;
  company_code: string;
  legal_address: string;
  contact_email: string;
  booking_terms: string;
}

/** payments_enabled follows the Stripe keys in Integrations; it isn't edited directly. */
export type SiteSettingsInput = Omit<SiteSettings, "payments_enabled">;

const COLUMNS =
  "phone, phone_display, city, tiktok_url, tiktok_handle, banner_enabled, banner_text, ga_measurement_id, payments_enabled, feature_price_eur, feature_days, legal_name, company_code, legal_address, contact_email, booking_terms";

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select(COLUMNS).eq("id", 1).single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function updateSiteSettings(input: SiteSettingsInput & { payments_enabled?: boolean }) {
  const { payments_enabled: _ignored, ...fields } = input;
  const { error } = await supabase
    .from("site_settings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

/** Site settings loaded by the root route. */
export function useSiteSettings(): SiteSettings {
  return useLoaderData({ from: "__root__" });
}

/** WhatsApp chat link for the site's number with a prefilled message. */
export function useWaLink() {
  const { phone } = useSiteSettings();
  const digits = phone.replace(/\D/g, "");
  return (message: string) => `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
