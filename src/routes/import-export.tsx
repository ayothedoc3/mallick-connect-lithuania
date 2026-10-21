import { createFileRoute } from "@tanstack/react-router";
import { Check, Ship, Plane, Truck, FileCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/import-export")({
  head: () => ({
    meta: [
      { title: "Import & Export Support | Mallick Assist Service" },
      { name: "description", content: "Shipping, customs and logistics support for goods in and out of Lithuania. Trusted by the diaspora community." },
      { property: "og:title", content: "Import & Export Support in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "We help you ship goods safely between Lithuania and your home country." },
      { property: "og:url", content: "https://mallickassistservice.com/import-export" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/import-export" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Import & Export Support",
        description: "Logistics, customs and shipping support for goods moving in and out of Lithuania: sea, air, road freight and customs clearance.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  component: ImportExportPage,
});

function ImportExportPage() {
  return (
    <>
      <PageHero
        eyebrow="Import & Export"
        title={<>Ship with confidence in & out of Lithuania</>}
        subtitle="From a single parcel to a full container, we help with logistics, paperwork and trusted shipping partners."
      >
        <WhatsAppButton size="lg" label="Ask about shipping" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Ship, t: "Sea freight", d: "Containers & LCL cargo to and from Lithuania." },
            { icon: Plane, t: "Air freight", d: "Faster shipping for time-sensitive goods." },
            { icon: Truck, t: "Road transport", d: "Across the EU and to neighboring regions." },
            { icon: FileCheck, t: "Customs help", d: "Paperwork and customs clearance support." },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-card p-6 border border-border shadow-soft">
              <div className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <c.icon className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-extrabold text-primary">{c.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-secondary/70 p-8">
            <h2 className="font-display text-2xl font-extrabold text-primary">What we ship</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              {[
                "Personal belongings",
                "Cars & vehicles",
                "Business goods",
                "Electronics",
                "Furniture",
                "Bulk cargo",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-primary-bright" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-primary text-primary-foreground p-8">
            <h2 className="font-display text-2xl font-extrabold">Why people trust us</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Vetted shipping partners across continents",
                "Clear pricing, no hidden surprises",
                "Updates at every step of the journey",
                "Diaspora-focused, we know what matters",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-accent" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Import & Export" title="Request shipping support" />
      </section>
    </>
  );
}
