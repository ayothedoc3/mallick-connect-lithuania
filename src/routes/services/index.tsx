import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ListingBrowser } from "@/components/ListingBrowser";
import { SetupNotice } from "@/components/SetupNotice";
import { fetchPublishedListings } from "@/lib/listings";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Local pros in Vilnius: braiders, chefs and more | Mallick Assist Service" },
      {
        name: "description",
        content:
          "Find braiders, chefs, photographers and other local pros in Vilnius, or list your own service. Message Mallick on WhatsApp and we'll connect you.",
      },
      { property: "og:title", content: "Local pros in Vilnius | Mallick Assist Service" },
      {
        property: "og:description",
        content: "Braiders, chefs, photographers and more from our community in Vilnius.",
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
        title={<>Local pros in Vilnius</>}
        subtitle="Braiders, chefs, photographers and more from our community. Message us on WhatsApp and we'll connect you."
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton size="lg" />
          <Link
            to="/sell"
            search={{ type: "service" }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3.5 text-base font-semibold hover:bg-white/10"
          >
            <Plus className="size-4" /> Offer your service
          </Link>
        </div>
      </PageHero>

      <section id="local-pros" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 py-12">
        <SetupNotice />
        <ListingBrowser kind="service" listings={pros} />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20 pt-8">
        <ServiceRequestForm title="Request any service" />
      </section>
    </>
  );
}
