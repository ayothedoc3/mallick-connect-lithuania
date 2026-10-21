import { supabase } from "./supabase";

async function post(path: string, body: unknown, auth: boolean): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Please sign in first.");
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  const res = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Payment couldn't be started.");
  return json.url;
}

/** Sends the seller to Stripe to pay for "Featured" placement. */
export async function payToFeature(listingId: string) {
  window.location.assign(await post("/api/checkout/feature", { listingId }, true));
}

export interface BookingRequest {
  listingId: string;
  start: string;
  end: string;
  guests: number;
  name: string;
  whatsapp: string;
  email: string;
  note: string;
}

/** Holds the dates and sends the customer to Stripe to pay the deposit. */
export async function payDeposit(booking: BookingRequest) {
  window.location.assign(await post("/api/checkout/booking", booking, false));
}
