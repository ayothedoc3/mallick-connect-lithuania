import { createFileRoute } from "@tanstack/react-router";
import { Check, PartyPopper, Users, Sparkles, Cake } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ListingBrowser } from "@/components/ListingBrowser";
import { fetchPublishedListings } from "@/lib/listings";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/hall-rentals/")({
  head: () => ({
    meta: [
      { title: "Hall Rentals in Lithuania | Mallick Assist Service" },
      { name: "description", content: "Event halls for weddings, birthdays, conferences and community gatherings across Lithuania. We help you book and organize." },
      { property: "og:title", content: "Hall Rentals in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "Book event halls for weddings, birthdays, conferences and cultural events with full support." },
      { property: "og:url", content: "https://mallickassistservice.com/hall-rentals" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/hall-rentals" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Hall Rentals in Lithuania",
        description: "Booking and organization support for event halls: weddings, birthdays, conferences and cultural events across Lithuania.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  loader: () => fetchPublishedListings("hall"),
  component: HallRentalsPage,
});

function HallRentalsPage() {
  const catalogue = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Hall Rentals"
        title={<>Event halls for every celebration</>}
        subtitle="From intimate gatherings to grand weddings, we help you find and book the right venue, and stay with you through the planning."
      >
        <WhatsAppButton size="lg" label="Ask about a hall" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: PartyPopper, t: "Weddings" },
            { icon: Cake, t: "Birthdays" },
            { icon: Users, t: "Conferences" },
            { icon: Sparkles, t: "Cultural events" },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-card p-6 border border-border text-center shadow-soft">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary-bright">
                <c.icon className="size-7" />
              </div>
              <p className="mt-4 font-display text-lg font-extrabold text-primary">{c.t}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-primary text-primary-foreground p-8 sm:p-10 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">What's included</h2>
            <p className="mt-2 text-primary-foreground/80">We don't just hand you keys. We help organize the day.</p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              "Venue scouting & booking",
              "Decoration coordination",
              "Catering connections",
              "Sound & lighting referrals",
              "Capacity planning",
              "Day-of support",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-accent shrink-0" />{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {catalogue.length > 0 && (
        <section id="book" className="scroll-mt-20 bg-secondary/60 py-16 mb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-extrabold text-primary">Available halls</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">Venues you can book online with a deposit. Pick your date on any hall to see the price.</p>
            <div className="mt-8">
              <ListingBrowser kind="hall" listings={catalogue} />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Hall Rentals" title="Request a hall booking" />
      </section>
    </>
  );
}
