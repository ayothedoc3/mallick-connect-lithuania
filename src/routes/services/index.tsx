import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ListingBrowser } from "@/components/ListingBrowser";
import { SetupNotice } from "@/components/SetupNotice";
import { SERVICES } from "@/lib/site";
import { fetchPublishedListings } from "@/lib/listings";

const TONES = ["navy", "blue", "yellow", "blue", "light", "navy"] as const;

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services in Vilnius: our support and local pros | Mallick Assist Service" },
      {
        name: "description",
        content:
          "Accommodation, hall rentals, currency exchange and shipping from Mallick, plus braiders, chefs, photographers and other local pros in Vilnius.",
      },
      { property: "og:title", content: "Services in Vilnius | Mallick Assist Service" },
      {
        property: "og:description",
        content:
          "Our six support services, plus trusted local pros: braiders, chefs, photographers and more.",
      },
      { property: "og:url", content: "https://mallickassistservice.com/services" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/services" }],
  }),
  loader: () => fetchPublishedListings("service"),
  component: ServicesPage,
});

function ServicesPage() {
  const pros = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={<>Everything you need, under one roof</>}
        subtitle="Our own support services, plus trusted local pros in Vilnius: braiders, chefs, photographers and more."
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton size="lg" />
          <a
            href="#local-pros"
            className="inline-flex items-center rounded-full border-2 border-white/40 px-6 py-3.5 text-base font-semibold hover:bg-white/10"
          >
            Find a local pro
          </a>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl font-extrabold text-primary">Our services</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard
              key={s.slug}
              title={s.title}
              description={s.short}
              icon={s.icon}
              tone={TONES[i]}
              href={`/${s.slug}`}
            />
          ))}
        </div>
      </section>

      <section id="local-pros" className="scroll-mt-20 bg-secondary/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-extrabold text-primary">
                Local pros in Vilnius
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Braiders, chefs, photographers and more from our community. Message us on WhatsApp
                and we'll connect you.
              </p>
            </div>
            <Link
              to="/sell"
              search={{ type: "service" }}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
            >
              <Plus className="size-4" /> Offer your service
            </Link>
          </div>
          <div className="mt-8">
            <SetupNotice />
            <ListingBrowser kind="service" listings={pros} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <ServiceRequestForm title="Request any service" />
      </section>
    </>
  );
}
