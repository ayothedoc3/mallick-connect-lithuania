import { supabase } from "./supabase";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  guests: number;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string;
  note: string | null;
  total_eur: number;
  deposit_eur: number;
  status: BookingStatus;
  expires_at: string;
  created_at: string;
  listings: { title: string; kind: "stay" | "hall" };
}

/** Dates already taken on a stay or hall: [start, end) with end exclusive. */
export async function fetchBookedRanges(
  listingId: string,
): Promise<{ start_date: string; end_date: string }[]> {
  const { data, error } = await supabase.rpc("listing_booked_ranges", { target: listingId });
  if (error) throw error;
  return data ?? [];
}

export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, listings(title, kind)")
    .order("start_date", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function cancelBooking(id: string) {
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
  if (error) throw error;
}
