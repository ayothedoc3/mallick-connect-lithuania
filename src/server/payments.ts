import Stripe from "stripe";
import {
  HttpError,
  getPrivateSettings,
  requireUser,
  supabaseAdmin,
  type PrivateSettings,
} from "./admin";
import { notifyStaff, sendEmail } from "./messaging";

function stripeFor(s: PrivateSettings) {
  if (!s.stripe_secret_key) throw new HttpError(503, "Online payments aren't switched on yet.");
  return new Stripe(s.stripe_secret_key);
}

const cents = (eur: number) => Math.round(eur * 100);
const DAY = 86_400_000;
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function siteSettings() {
  const { data, error } = await supabaseAdmin()
    .from("site_settings")
    .select("feature_price_eur, feature_days")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return { price: Number(data.feature_price_eur), days: Number(data.feature_days) };
}

// ───────────── Featured placement ─────────────

export async function startFeatureCheckout(request: Request) {
  const { user } = await requireUser(request);
  const { listingId } = (await request.json()) as { listingId: string };
  const { data: l, error } = await supabaseAdmin()
    .from("listings")
    .select("id, user_id, kind, title, status")
    .eq("id", listingId)
    .single();
  if (error) throw new HttpError(404, "Listing not found.");
  if (l.user_id !== user.id) throw new HttpError(403, "This isn't your listing.");
  if (l.status !== "published") throw new HttpError(400, "Only live listings can be featured.");
  if (l.kind !== "item" && l.kind !== "service")
    throw new HttpError(400, "This listing can't be featured.");

  const s = await getPrivateSettings();
  const { price, days } = await siteSettings();
  const session = await stripeFor(s).checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: cents(price),
          product_data: { name: `Featured for ${days} days: ${l.title}` },
        },
      },
    ],
    metadata: { type: "feature", listing_id: l.id },
    success_url: `${s.site_url}/my-listings?featured=1`,
    cancel_url: `${s.site_url}/my-listings`,
  });
  return { url: session.url };
}

// ───────────── Booking deposits ─────────────

interface BookingInput {
  listingId: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD, exclusive
  guests: number;
  name: string;
  whatsapp: string;
  email: string;
  note: string;
}

export async function startBookingCheckout(request: Request) {
  const b = (await request.json()) as BookingInput;
  const db = supabaseAdmin();
  const { data: l, error } = await db
    .from("listings")
    .select("id, kind, title, status, price_eur, deposit_eur, capacity")
    .eq("id", b.listingId)
    .single();
  if (error) throw new HttpError(404, "Listing not found.");
  if ((l.kind !== "stay" && l.kind !== "hall") || l.status !== "published") {
    throw new HttpError(400, "This listing can't be booked online.");
  }
  if (l.price_eur === null || !l.deposit_eur)
    throw new HttpError(400, "This listing has no online price yet.");

  const start = new Date(`${b.start}T00:00:00Z`);
  const end = new Date(`${b.end}T00:00:00Z`);
  const today = new Date(`${isoDate(new Date())}T00:00:00Z`);
  const units = Math.round((end.getTime() - start.getTime()) / DAY);
  if (Number.isNaN(units) || start < today || units < 1 || units > 90) {
    throw new HttpError(400, "Please choose valid dates.");
  }
  const guests = Math.floor(Number(b.guests));
  if (!(guests >= 1) || (l.capacity && guests > l.capacity)) {
    throw new HttpError(400, `This place takes up to ${l.capacity} guests.`);
  }
  for (const [field, value] of [
    ["name", b.name],
    ["WhatsApp number", b.whatsapp],
    ["email", b.email],
  ] as const) {
    if (!value?.trim()) throw new HttpError(400, `Please enter your ${field}.`);
  }

  // Free dates held by checkouts that were abandoned.
  const { error: freeErr } = await db
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("listing_id", l.id)
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());
  if (freeErr) throw freeErr;

  const total = units * Number(l.price_eur);
  const deposit = Math.min(Number(l.deposit_eur), total);
  const { data: booking, error: insErr } = await db
    .from("bookings")
    .insert({
      listing_id: l.id,
      start_date: b.start,
      end_date: b.end,
      guests,
      customer_name: b.name.trim(),
      customer_whatsapp: b.whatsapp.trim(),
      customer_email: b.email.trim(),
      note: b.note?.trim() || null,
      total_eur: total,
      deposit_eur: deposit,
    })
    .select("id")
    .single();
  if (insErr) {
    if (insErr.code === "23P01")
      throw new HttpError(409, "Those dates were just booked. Please pick others.");
    throw insErr;
  }

  const s = await getPrivateSettings();
  const unit =
    l.kind === "stay" ? (units === 1 ? "night" : "nights") : units === 1 ? "day" : "days";
  const session = await stripeFor(s).checkout.sessions.create({
    mode: "payment",
    submit_type: "book",
    customer_email: b.email.trim(),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: cents(deposit),
          product_data: {
            name: `Deposit: ${l.title}`,
            description: `${b.start} to ${b.end}, ${units} ${unit}, ${guests} guest(s). Total €${total}, balance due on arrival.`,
          },
        },
      },
    ],
    metadata: { type: "booking", booking_id: booking.id },
    // Stripe allows 30 minutes minimum; the booking hold lasts 35.
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    success_url: `${s.site_url}/booking-confirmed?booking=${booking.id}`,
    cancel_url: `${s.site_url}/${l.kind === "stay" ? "accommodation" : "hall-rentals"}/${l.id}`,
  });
  const { error: updErr } = await db
    .from("bookings")
    .update({ stripe_session_id: session.id })
    .eq("id", booking.id);
  if (updErr) throw updErr;
  return { url: session.url };
}

// ───────────── Webhook ─────────────

export async function handleStripeWebhook(request: Request) {
  const s = await getPrivateSettings();
  const signature = request.headers.get("stripe-signature");
  if (!signature) throw new HttpError(400, "Missing signature.");
  const event = await stripeFor(s).webhooks.constructEventAsync(
    await request.text(),
    signature,
    s.stripe_webhook_secret,
  );

  if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") {
    const meta = event.data.object.metadata ?? {};
    if (meta.type === "feature") await featurePaid(meta.listing_id);
    if (meta.type === "booking") await bookingPaid(s, meta.booking_id);
  }
  if (event.type === "checkout.session.expired") {
    const meta = event.data.object.metadata ?? {};
    if (meta.type === "booking") {
      const { error } = await supabaseAdmin()
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", meta.booking_id)
        .eq("status", "pending");
      if (error) throw error;
    }
  }
  return { received: true };
}

async function featurePaid(listingId: string) {
  const db = supabaseAdmin();
  const { days } = await siteSettings();
  const { data: l, error } = await db
    .from("listings")
    .select("featured_until")
    .eq("id", listingId)
    .single();
  if (error) throw error;
  const from = Math.max(Date.now(), l.featured_until ? Date.parse(l.featured_until) : 0);
  const { error: updErr } = await db
    .from("listings")
    .update({ featured_until: new Date(from + days * DAY).toISOString() })
    .eq("id", listingId);
  if (updErr) throw updErr;
}

async function bookingPaid(s: PrivateSettings, bookingId: string) {
  const db = supabaseAdmin();
  const { data: b, error } = await db
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("status", "pending")
    .select("*, listings(title, kind)")
    .maybeSingle();
  if (error) throw error;
  if (!b) return; // already confirmed: Stripe can deliver an event twice
  const listing = b.listings as unknown as { title: string; kind: string };
  const dates = `${b.start_date} to ${b.end_date}`;
  await Promise.all([
    notifyStaff(
      {
        subject: `New booking: ${listing.title}, ${dates}`,
        lines: [
          `Deposit paid: ${listing.title}`,
          `${dates}, ${b.guests} guest(s)`,
          `${b.customer_name}, WhatsApp ${b.customer_whatsapp}, ${b.customer_email}`,
          `Deposit €${b.deposit_eur} of €${b.total_eur}`,
          ...(b.note ? [`"${b.note}"`] : []),
        ],
        link: { label: "Open bookings", url: `${s.site_url}/precious?tab=bookings` },
      },
      s,
    ),
    sendEmail(s, [b.customer_email], {
      subject: `Booking confirmed: ${listing.title}`,
      lines: [
        `Your booking is confirmed, ${b.customer_name}`,
        `${listing.title}, ${dates}, ${b.guests} guest(s)`,
        `Deposit paid: €${b.deposit_eur}. Balance due on arrival: €${Number(b.total_eur) - Number(b.deposit_eur)}.`,
        "We'll message you on WhatsApp with the address and check-in details.",
      ],
    }),
  ]);
}
