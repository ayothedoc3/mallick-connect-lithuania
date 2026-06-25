import { createFileRoute } from "@tanstack/react-router";
import { Check, ArrowLeftRight, ShieldCheck, Info, Banknote } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/currency-exchange")({
  head: () => ({
    meta: [
      { title: "Currency Exchange Assistance in Lithuania | Mallick Assist Service" },
      { name: "description", content: "Guidance and trusted contacts for exchanging and sending money safely in Lithuania. We help you find fair rates and avoid scams." },
      { property: "og:title", content: "Currency Exchange Assistance in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "Safe, transparent help with currency exchange and money transfers for the diaspora community." },
      { property: "og:url", content: "https://mallick-connect-lithuania.lovable.app/currency-exchange" },
    ],
    links: [{ rel: "canonical", href: "https://mallick-connect-lithuania.lovable.app/currency-exchange" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Currency Exchange Assistance",
        description: "Guidance and trusted referrals for currency exchange and money transfers in Lithuania.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  component: CurrencyExchangePage,
});

function CurrencyExchangePage() {
  return (
    <>
      <PageHero
        eyebrow="Currency Exchange Assistance"
        title={<>Exchange and send money the <span className="text-accent">safe way</span></>}
        subtitle="New to Lithuania and unsure where to change or send money? We guide you to fair rates and trusted, transparent options."
      >
        <WhatsAppButton size="lg" label="Ask about exchange" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: ArrowLeftRight, t: "Exchange guidance", d: "Where to change currency at a fair, honest rate." },
            { icon: Banknote, t: "Transfer help", d: "Sending money home, explained step by step." },
            { icon: ShieldCheck, t: "Scam protection", d: "We help you steer clear of bad deals and fraud." },
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

        <div className="mt-12 rounded-3xl bg-secondary/70 p-8">
          <h2 className="font-display text-2xl font-extrabold text-primary">How we help</h2>
          <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
            {[
              "Pointing you to trusted exchange points",
              "Explaining rates and fees in plain language",
              "Help comparing transfer options",
              "Support in your own language",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-primary-bright shrink-0" />{x}</li>
            ))}
          </ul>
        </div>

        {/* Compliance note: this is assistance and referral, not a licensed exchange. */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <Info className="size-5 shrink-0 text-primary-bright" />
          <p>
            We provide currency exchange as an assistance and referral service. We are not a licensed
            financial institution and do not hold or move your funds on your behalf.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Currency Exchange Assistance" title="Ask about currency exchange" />
      </section>
    </>
  );
}
