import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Bed, Home } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ListingBrowser } from "@/components/ListingBrowser";
import { fetchPublishedListings } from "@/lib/listings";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/accommodation/")({
  head: () => ({
    meta: [
      { title: "Accommodation in Lithuania | Mallick Assist Service" },
      { name: "description", content: "Trusted short-term and long-term accommodation across Lithuania for students, migrants, and visitors. Fast, safe, community-backed." },
      { property: "og:title", content: "Accommodation in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "Short-term and long-term housing support for migrants, students and visitors in Lithuania." },
      { property: "og:url", content: "https://mallickassistservice.com/accommodation" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/accommodation" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Accommodation Support in Lithuania",
        description: "Short-term and long-term accommodation support for migrants, students and visitors across Lithuania.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  loader: () => fetchPublishedListings("stay"),
  component: AccommodationPage,
});

function AccommodationPage() {
  const catalogue = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Accommodation"
        title={<>Short & long-term stays you can trust</>}
        subtitle="Whether you're arriving for a week or settling for a year, we connect you with safe, vetted homes in Lithuania."
      >
        <WhatsAppButton size="lg" label="Ask about accommodation" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-6">
        {[
          {
            icon: Bed,
            title: "Short Term Accommodation",
            href: "/short-term-accommodation",
            desc: "Comfortable stays from one night to a few weeks. Perfect for visitors, business trips, students arriving, or transition periods.",
            bullets: ["Furnished apartments & rooms", "Flexible check-in", "Vetted hosts", "Vilnius, Kaunas, Klaipėda & more"],
            tone: "bg-primary text-primary-foreground",
          },
          {
            icon: Home,
            title: "Long Term Accommodation",
            href: "/long-term-accommodation",
            desc: "Reliable housing for migrants, students and families. We help you find a home and navigate contracts in your language.",
            bullets: ["6 to 12+ month rentals", "Contract guidance", "Roommate matching", "Help with deposits & utilities"],
            tone: "bg-accent text-accent-foreground",
          },
        ].map((b) => (
          <div key={b.title} className={`rounded-3xl p-8 ${b.tone} shadow-card`}>
            <div className="grid size-14 place-items-center rounded-2xl bg-white/95 text-primary">
              <b.icon className="size-7" strokeWidth={2.2} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold">{b.title}</h2>
            <p className="mt-2 opacity-90">{b.desc}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {b.bullets.map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 shrink-0" />{x}</li>
              ))}
            </ul>
            <Link to={b.href} className="mt-6 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline">
              View {b.title} details
            </Link>
          </div>
        ))}
      </section>

      {catalogue.length > 0 && (
        <section id="book" className="scroll-mt-20 bg-secondary/60 py-16 mb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-extrabold text-primary">Available stays</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">Rooms, studios and apartments you can book online with a deposit. Pick your dates on any stay to see the price.</p>
            <div className="mt-8">
              <ListingBrowser kind="stay" listings={catalogue} />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Short Term Accommodation" title="Request accommodation" />
      </section>
    </>
  );
}
