import { createFileRoute } from "@tanstack/react-router";
import { Check, Home, FileText, Users, Wallet } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/long-term-accommodation")({
  head: () => ({
    meta: [
      { title: "Long Term Accommodation in Lithuania | Mallick Assist Service" },
      { name: "description", content: "Reliable long-term housing for migrants, students and families settling in Lithuania. Contract guidance in your language, deposit and utility help, roommate matching." },
      { property: "og:title", content: "Long Term Accommodation in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "Find a real home and navigate the rental process with support you can trust." },
      { property: "og:url", content: "https://mallickassistservice.com/long-term-accommodation" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/long-term-accommodation" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Long Term Accommodation in Lithuania",
        description: "Long-term rental sourcing and settling-in support for migrants, students and families across Lithuania.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  component: LongTermPage,
});

function LongTermPage() {
  return (
    <>
      <PageHero
        eyebrow="Long Term Accommodation"
        title={<>Find a place to truly call <span className="text-accent">home</span></>}
        subtitle="Settling in Lithuania for a year or more? We help you find the right rental and guide you through contracts, deposits and the details newcomers often miss."
      >
        <WhatsAppButton size="lg" label="Ask about long-term housing" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Home, t: "6 to 12+ months", d: "Apartments and rooms for a real, settled stay." },
            { icon: FileText, t: "Contract guidance", d: "We explain the lease in your language before you sign." },
            { icon: Wallet, t: "Deposits & utilities", d: "Help understanding deposits, bills and what is fair." },
            { icon: Users, t: "Roommate matching", d: "Share costs with vetted, like-minded people." },
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
            <h2 className="font-display text-2xl font-extrabold text-primary">We help you avoid</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {[
                "Scam listings and fake landlords",
                "Unfair deposit terms",
                "Contracts you cannot read",
                "Hidden fees and surprise bills",
                "Losing your deposit at move-out",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-primary-bright shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-primary text-primary-foreground p-8">
            <h2 className="font-display text-2xl font-extrabold">How it works</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Share your budget, area and move-in date",
                "We source rentals that genuinely fit",
                "We arrange viewings and talk to landlords",
                "We support you through signing and after move-in",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-accent shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Long Term Accommodation" title="Request long-term housing" />
      </section>
    </>
  );
}
