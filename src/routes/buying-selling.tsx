import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShoppingCart, Tag, Search, Handshake } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/buying-selling")({
  head: () => ({
    meta: [
      { title: "Buying & Selling Items in Lithuania | Mallick Assist Service" },
      { name: "description", content: "Find what you need and sell what you do not. We connect trusted buyers and sellers across the diaspora community in Lithuania." },
      { property: "og:title", content: "Buying & Selling Items in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "Source furniture, electronics and essentials, or sell your items to trusted buyers." },
      { property: "og:url", content: "https://mallickassistservice.com/buying-selling" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/buying-selling" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Buying & Selling Items",
        description: "Connecting trusted buyers and sellers in the diaspora community across Lithuania.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  component: BuyingSellingPage,
});

function BuyingSellingPage() {
  return (
    <>
      <PageHero
        eyebrow="Buying & Selling Items"
        title={<>Buy what you need, sell what you <span className="text-accent">do not</span></>}
        subtitle="Setting up a new home or moving on? We connect you with trusted buyers and sellers in the community, so nothing goes to waste."
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/marketplace" className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5 text-base font-bold text-accent-foreground shadow-soft hover:brightness-105">
            Browse the marketplace
          </Link>
          <Link to="/sell" className="inline-flex items-center justify-center rounded-full border-2 border-white/40 px-6 py-3.5 text-base font-bold text-primary-foreground hover:bg-white/10">
            Sell an item
          </Link>
          <WhatsAppButton size="lg" label="Ask about buying or selling" />
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Search, t: "We source items", d: "Tell us what you need and we find it for you." },
            { icon: Tag, t: "We help you sell", d: "List your items to real, trusted buyers." },
            { icon: Handshake, t: "Trusted connections", d: "Deals within a community that vouches for itself." },
            { icon: ShoppingCart, t: "Everyday essentials", d: "Furniture, electronics, appliances and more." },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-card p-6 border border-border shadow-soft">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <c.icon className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-extrabold text-primary">{c.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-secondary/70 p-8">
            <h2 className="font-display text-2xl font-extrabold text-primary">Popular items</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              {[
                "Furniture & home goods",
                "Electronics & phones",
                "Kitchen appliances",
                "Bikes & transport",
                "Study & work gear",
                "Baby & family items",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-primary-bright shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-primary text-primary-foreground p-8">
            <h2 className="font-display text-2xl font-extrabold">How it works</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Send us what you want to buy or sell",
                "We match you with the right person",
                "We help agree a fair price",
                "You meet, exchange and you are done",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-accent shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Buying & Selling Items" title="Request buying or selling help" />
      </section>
    </>
  );
}
