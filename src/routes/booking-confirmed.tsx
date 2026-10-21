import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/booking-confirmed")({
  head: () => ({
    meta: [
      { title: "Booking confirmed | Mallick Assist Service" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingConfirmed,
});

// Stripe sends customers here after paying the deposit.
function BookingConfirmed() {
  return (
    <section className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto size-14 text-whatsapp" />
      <h1 className="mt-4 font-display text-3xl font-extrabold text-primary">
        Deposit paid, you're booked
      </h1>
      <p className="mt-3 text-muted-foreground">
        We've emailed your confirmation. We'll message you on WhatsApp with the address and check-in
        details before your date.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <WhatsAppButton
          label="Message us"
          message="Hello Mallick Assist Service, I just paid a booking deposit."
        />
        <Link
          to="/"
          className="inline-flex items-center rounded-full border border-input px-5 py-3 text-sm font-semibold"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
