import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { fetchBookedRanges } from "@/lib/bookings";
import { formatPrice, type Listing } from "@/lib/listings";
import { payDeposit } from "@/lib/payments";
import { useSiteSettings } from "@/lib/settings";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

/** Pick dates, see the price, pay the deposit on Stripe. Stays book nights; halls book a day. */
export function BookingWidget({ listing }: { listing: Listing }) {
  const site = useSiteSettings();
  const isStay = listing.kind === "stay";
  const [range, setRange] = useState<DateRange | undefined>();
  const [day, setDay] = useState<Date | undefined>();
  const [form, setForm] = useState({ guests: "1", name: "", whatsapp: "", email: "", note: "" });
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const booked = useQuery({
    queryKey: ["booked", listing.id],
    queryFn: () => fetchBookedRanges(listing.id),
  });
  // Occupied nights/days: start up to the day before end.
  const taken = (booked.data ?? []).map((b) => ({
    from: parseISO(b.start_date),
    to: subDays(parseISO(b.end_date), 1),
  }));

  const start = isStay ? range?.from : day;
  const end = isStay ? range?.to : day && addDays(day, 1);
  const units = start && end ? differenceInCalendarDays(end, start) : 0;
  const price = Number(listing.price_eur);
  const total = units * price;
  const deposit = Math.min(Number(listing.deposit_eur), total);

  const pay = useMutation({
    mutationFn: () =>
      payDeposit({
        listingId: listing.id,
        start: ymd(start!),
        end: ymd(end!),
        guests: Number(form.guests),
        name: form.name,
        whatsapp: form.whatsapp,
        email: form.email,
        note: form.note,
      }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Booking couldn't be started."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (units < 1) {
      toast.error(isStay ? "Choose your check-in and check-out dates." : "Choose a date.");
      return;
    }
    pay.mutate();
  }

  const today = new Date();
  const disabled = [{ before: today }, ...taken];

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-primary">
        <CalendarCheck className="size-5" /> Book online
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-border">
        {isStay ? (
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={disabled}
            excludeDisabled
            min={1}
            numberOfMonths={1}
            className="mx-auto"
          />
        ) : (
          <Calendar
            mode="single"
            selected={day}
            onSelect={setDay}
            disabled={disabled}
            className="mx-auto"
          />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {units > 0
          ? `${format(start!, "d MMM")} to ${format(end!, "d MMM yyyy")}: ${units} ${isStay ? (units === 1 ? "night" : "nights") : units === 1 ? "day" : "days"}`
          : isStay
            ? "Tap your check-in date, then your check-out date. Greyed-out dates are taken."
            : "Tap the date of your event. Greyed-out dates are taken."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Guests *</span>
          <input
            required
            type="number"
            min={1}
            max={listing.capacity ?? undefined}
            value={form.guests}
            onChange={set("guests")}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Full name *</span>
          <input
            required
            maxLength={120}
            value={form.name}
            onChange={set("name")}
            className={inputCls}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">WhatsApp number *</span>
          <input
            required
            maxLength={40}
            value={form.whatsapp}
            onChange={set("whatsapp")}
            className={inputCls}
            placeholder="+370…"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Email *</span>
          <input
            required
            type="email"
            maxLength={200}
            value={form.email}
            onChange={set("email")}
            className={inputCls}
            autoComplete="email"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">
          Anything we should know?
        </span>
        <textarea
          rows={2}
          maxLength={2000}
          value={form.note}
          onChange={set("note")}
          className={inputCls}
          placeholder={isStay ? "Arrival time, questions…" : "Type of event, setup time…"}
        />
      </label>

      {units > 0 && (
        <dl className="grid gap-1 rounded-2xl bg-secondary/70 p-4 text-sm">
          <div className="flex justify-between">
            <dt>
              {formatPrice(price)} × {units}
            </dt>
            <dd>{formatPrice(total)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-primary">
            <dt>Deposit to pay now</dt>
            <dd>{formatPrice(deposit)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Balance due on arrival</dt>
            <dd>{formatPrice(total - deposit)}</dd>
          </div>
        </dl>
      )}

      <p className="text-xs text-muted-foreground">{site.booking_terms}</p>

      <button
        type="submit"
        disabled={pay.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary-bright disabled:opacity-60"
      >
        {pay.isPending && <Loader2 className="size-4 animate-spin" />}
        {units > 0 ? `Pay ${formatPrice(deposit)} deposit` : "Choose dates to book"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Secure payment by Stripe. Your dates are held for 30 minutes while you pay.
      </p>
    </form>
  );
}
