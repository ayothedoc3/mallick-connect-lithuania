import { createFileRoute } from "@tanstack/react-router";
import { Check, Bed, CalendarClock, ShieldCheck, MapPin } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/short-term-accommodation")({
  head: () => ({
    meta: [
      { title: "Short Term Accommodation in Lithuania | Mallick Assist Service" },
      { name: "description", content: "Furnished short-term stays in Lithuania for visitors, students arriving, and people in transition. Flexible check-in, vetted hosts, fast WhatsApp booking." },
      { property: "og:title", content: "Short Term Accommodation in Lithuania | Mallick Assist Service" },
      { property: "og:description", content: "Comfortable short stays from one night to a few weeks, across Vilnius, Kaunas, Klaipeda and more." },
      { property: "og:url", content: "https://mallick-connect-lithuania.lovable.app/short-term-accommodation" },
    ],
    links: [{ rel: "canonical", href: "https://mallick-connect-lithuania.lovable.app/short-term-accommodation" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Short Term Accommodation in Lithuania",
        description: "Furnished short-term stays for visitors, students and people in transition across Lithuania.",
        areaServed: "Lithuania",
        provider: { "@type": "LocalBusiness", name: "Mallick Assist Service", telephone: "+37062434541" },
      }),
    }],
  }),
  component: ShortTermPage,
});

function ShortTermPage() {
  return (
    <>
      <PageHero
        eyebrow="Short Term Accommodation"
        title={<>A safe place to land, from your <span className="text-accent">first night</span></>}
        subtitle="Just arriving for a few days or a few weeks? We set you up with a comfortable, vetted home so you can settle in without the stress."
      >
        <WhatsAppButton size="lg" label="Ask about a short stay" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Bed, t: "Furnished & ready", d: "Move in with everything you need from day one." },
            { icon: CalendarClock, t: "Flexible check-in", d: "Late arrival or odd hours? We work around your travel." },
            { icon: ShieldCheck, t: "Vetted hosts", d: "Every stay is checked so you book with confidence." },
            { icon: MapPin, t: "Across Lithuania", d: "Vilnius, Kaunas, Klaipeda and more." },
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
            <h2 className="font-display text-2xl font-extrabold text-primary">Perfect for</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              {[
                "New arrivals before a long-term home",
                "Students starting the semester",
                "Business and work trips",
                "Family visiting from abroad",
                "Transition between apartments",
                "Anyone needing a few nights fast",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-primary-bright shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-primary text-primary-foreground p-8">
            <h2 className="font-display text-2xl font-extrabold">How it works</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Tell us your dates, city and budget on WhatsApp",
                "We send you vetted options to choose from",
                "We confirm the booking and check-in details",
                "We stay reachable through your whole stay",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="size-4 mt-0.5 text-accent shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ServiceRequestForm defaultService="Short Term Accommodation" title="Request a short stay" />
      </section>
    </>
  );
}
