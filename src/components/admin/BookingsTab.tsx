import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { DETAIL_ROUTE } from "@/components/ListingCard";
import { cancelBooking, fetchBookings, type Booking } from "@/lib/bookings";
import { formatPrice } from "@/lib/listings";
import { cn } from "@/lib/utils";

type Filter = "upcoming" | "past" | "pending" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "pending", label: "Paying now" },
  { id: "cancelled", label: "Cancelled" },
];

const today = format(new Date(), "yyyy-MM-dd");

function matches(b: Booking, f: Filter) {
  if (f === "upcoming") return b.status === "confirmed" && b.end_date >= today;
  if (f === "past") return b.status === "confirmed" && b.end_date < today;
  if (f === "pending") return b.status === "pending" && Date.parse(b.expires_at) > Date.now();
  return b.status === "cancelled";
}

const nice = (d: string) => format(parseISO(d), "EEE d MMM yyyy");

export function BookingsTab() {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const queryClient = useQueryClient();
  const bookings = useQuery({ queryKey: ["admin", "bookings"], queryFn: fetchBookings });

  const cancel = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      toast.success("Booking cancelled. Refund the deposit in Stripe if needed.");
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel."),
  });

  if (bookings.isLoading) return <p className="text-sm text-muted-foreground">Loading bookings…</p>;
  if (bookings.error)
    return <p className="text-sm text-destructive">{(bookings.error as Error).message}</p>;

  const all = bookings.data ?? [];
  const shown = all.filter((b) => matches(b, filter));
  if (filter === "past" || filter === "cancelled") shown.reverse();

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Stays and halls booked online with a deposit. Refunds are made in your Stripe dashboard.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary-bright",
            )}
          >
            {f.label}{" "}
            <span className="opacity-70">({all.filter((b) => matches(b, f.id)).length})</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {shown.length === 0 && (
          <p className="rounded-3xl bg-secondary/70 p-10 text-center text-sm text-muted-foreground">
            No bookings here.
          </p>
        )}
        {shown.map((b) => (
          <article key={b.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link
                to={DETAIL_ROUTE[b.listings.kind]}
                params={{ id: b.listing_id }}
                className="font-display text-lg font-extrabold text-primary hover:underline"
              >
                {b.listings.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                Booked {new Date(b.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold">
              {nice(b.start_date)} to {nice(b.end_date)} · {b.guests} guest
              {b.guests === 1 ? "" : "s"}
            </p>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="font-semibold text-primary">Name:</dt>
                <dd>{b.customer_name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-primary">Email:</dt>
                <dd className="break-all">{b.customer_email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-primary">Deposit:</dt>
                <dd>
                  {formatPrice(b.deposit_eur)} of {formatPrice(b.total_eur)}
                  {b.status === "confirmed" && " (paid)"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-primary">Balance on arrival:</dt>
                <dd>{formatPrice(Number(b.total_eur) - Number(b.deposit_eur))}</dd>
              </div>
            </dl>
            {b.note && (
              <p className="mt-3 whitespace-pre-line rounded-2xl bg-secondary/70 p-3 text-sm">
                {b.note}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <a
                href={`https://wa.me/${b.customer_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${b.customer_name}, this is Mallick Assist Service about your booking at ${b.listings.title}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-4 py-1.5 font-bold text-whatsapp-foreground hover:brightness-110"
              >
                <MessageCircle className="size-3.5" /> WhatsApp {b.customer_whatsapp}
              </a>
              {b.status !== "cancelled" && (
                <button
                  disabled={cancel.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Cancel ${b.customer_name}'s booking? The dates become free again.`,
                      )
                    )
                      cancel.mutate(b.id);
                  }}
                  className="rounded-full border border-destructive/40 px-3 py-1.5 font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
                >
                  Cancel booking
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
