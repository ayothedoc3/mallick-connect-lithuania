import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SERVICES } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services | Mallick Assist Service" },
      { name: "description", content: "Accommodation, hall rentals, currency exchange, buying & selling, and import/export, all the support you need in Lithuania." },
      { property: "og:title", content: "Our Services | Mallick Assist Service" },
      { property: "og:description", content: "Six trusted support services for migrants, students and diaspora in Lithuania." },
      { property: "og:url", content: "https://mallickassistservice.com/services" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/services" }],
  }),
  component: ServicesPage,
});


function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={<>Everything you need, under one roof</>}
        subtitle="From your first night in Lithuania to shipping goods overseas, we provide trusted support across six core services."
      >
        <WhatsAppButton size="lg" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <ServiceCard key={s.slug} title={s.title} description={s.short} icon={s.icon} href={`/${s.slug}`} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm title="Request any service" />
      </section>
    </>
  );
}
