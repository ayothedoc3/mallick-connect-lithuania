import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Clock, HeartHandshake, MapPin, ArrowRight, Quote, MessageSquare, ClipboardList, Compass } from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SERVICES, SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mallick Assist Service — Support Services in Lithuania" },
      { name: "description", content: "Trusted support for accommodation, hall rentals, currency exchange, buying & selling, and import/export in Lithuania. One contact for everything you need." },
      { property: "og:title", content: "Mallick Assist Service — Trusted Support in Lithuania" },
      { property: "og:description", content: "One trusted contact for accommodation, hall rentals, exchange, trade and shipping in Lithuania." },
      { property: "og:url", content: "https://mallick-connect-lithuania.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://mallick-connect-lithuania.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Mallick Assist Service",
          description: "Support and concierge service helping migrants, students, and diaspora communities in Lithuania with accommodation, hall rentals, currency exchange, buying and selling, and import/export.",
          telephone: "+37062434541",
          email: "info@mallickassist.com",
          url: "https://mallick-connect-lithuania.lovable.app/",
          address: { "@type": "PostalAddress", addressCountry: "LT", addressLocality: "Vilnius" },
          areaServed: "Lithuania",
        }),
      },
    ],
  }),
  component: Home,
});

const TONES = ["navy", "blue", "yellow", "blue", "light", "navy"] as const;

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="bg-hero relative overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 bg-grid-soft opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:py-28 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              <MapPin className="size-3.5" /> Based in Lithuania
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              Trusted support services for{" "}
              <span className="text-accent">accommodation, events, exchange</span>{" "}
              and shipping in Lithuania
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-primary-foreground/85">
              Mallick Assist Service helps people settle, move, trade and organize events —
              all through one trusted contact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground hover:brightness-105 shadow-soft"
              >
                Request a Service <ArrowRight className="size-4" />
              </Link>
              <WhatsAppButton size="lg" />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/80">
              {["Fast WhatsApp response", "Local Lithuania support", "Diaspora-friendly"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check className="size-4 text-accent" />{t}</span>
              ))}
            </div>
          </div>

          {/* Hero card stack */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-6 -right-6 size-56 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 size-72 rounded-full bg-primary-bright/40 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {SERVICES.slice(0, 4).map((s, i) => (
                <div
                  key={s.slug}
                  className={`rounded-3xl p-5 backdrop-blur ${
                    i % 2 === 0 ? "bg-white/10 border border-white/20" : "bg-accent text-accent-foreground"
                  } ${i === 1 ? "translate-y-6" : ""} ${i === 2 ? "-translate-y-6" : ""}`}
                >
                  <div className="grid size-11 place-items-center rounded-xl bg-white/95 text-primary">
                    <Compass className="size-5" />
                  </div>
                  <p className="mt-3 font-display font-extrabold leading-tight">{s.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-bright">What we do</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-primary">
              Six services. One trusted contact.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            From your first night in Lithuania to shipping goods home — we handle the details so you don't have to.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard
              key={s.slug}
              title={s.title}
              description={s.short}
              icon={s.icon}
              tone={TONES[i]}
              href={
                s.slug.includes("accommodation") ? "/accommodation"
                : s.slug === "hall-rentals" ? "/hall-rentals"
                : s.slug === "import-export" ? "/import-export"
                : "/services"
              }
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-bright">How it works</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-primary">
              Three simple steps
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: MessageSquare, title: "Tell us what you need", text: "Send a quick message on WhatsApp or fill out the form." },
              { icon: ClipboardList, title: "We confirm options", text: "We check availability and send you trusted options to pick from." },
              { icon: HeartHandshake, title: "Support start to finish", text: "We stay with you until everything is settled and you're happy." },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-3xl bg-card p-7 shadow-soft border border-border">
                <span className="absolute -top-4 -left-4 grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground font-display font-extrabold text-lg">
                  0{i + 1}
                </span>
                <s.icon className="size-8 text-primary-bright" strokeWidth={2.2} />
                <h3 className="mt-4 font-display text-xl font-extrabold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-bright">Why choose us</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-primary">
            Built on trust. Powered by community.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're not a faceless agency. We're part of the diaspora community in Lithuania,
            and we treat every request like it's for family.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-5">
            {[
              { icon: HeartHandshake, t: "Trusted by community", d: "Recommended across diaspora networks." },
              { icon: MapPin, t: "Local Lithuania support", d: "On-the-ground knowledge in every city." },
              { icon: Clock, t: "Fast response", d: "Most WhatsApp messages answered within minutes." },
              { icon: Sparkles, t: "Diaspora-friendly", d: "We speak your language, literally and figuratively." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-border bg-card p-5">
                <f.icon className="size-6 text-accent-foreground bg-accent rounded-lg p-1" />
                <p className="mt-3 font-display font-extrabold text-primary">{f.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-primary p-8 sm:p-10 text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-44 rounded-full bg-accent/40 blur-2xl" />
          <h3 className="font-display text-2xl font-extrabold">Need something fast?</h3>
          <p className="mt-2 text-primary-foreground/80">
            Send us a WhatsApp message and we'll respond within minutes during working hours.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <WhatsAppButton size="lg" className="w-full sm:w-auto" />
            <a href={`tel:${SITE.phone}`} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-6 py-3.5 text-sm font-bold hover:bg-white/10">
              Call {SITE.phoneDisplay}
            </a>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[["500+", "Clients helped"], ["6", "Services"], ["24/7", "WhatsApp"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl font-extrabold text-accent">{n}</div>
                <div className="text-xs uppercase tracking-wider opacity-75 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-bright">Testimonials</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-primary">
              What our community says
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { q: "They found me a great short-stay in Vilnius the same day I arrived. I felt cared for from minute one.", n: "Amaka O.", r: "New arrival, Vilnius" },
              { q: "Organized our wedding hall, decorations, and even helped with the currency exchange. One contact for everything.", n: "Ravi & Priya", r: "Wedding, Kaunas" },
              { q: "Shipped a container back home without stress. They handled paperwork I had no idea about.", n: "Samuel K.", r: "Import/Export client" },
            ].map((t) => (
              <figure key={t.n} className="rounded-3xl bg-card p-7 border border-border shadow-soft">
                <Quote className="size-7 text-accent" />
                <blockquote className="mt-3 text-foreground/90">"{t.q}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground font-display font-extrabold">
                    {t.n[0]}
                  </div>
                  <div>
                    <div className="font-bold text-primary">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-bright">Contact us</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-primary">
            Let's talk about what you need
          </h2>
          <p className="mt-4 text-muted-foreground">
            Send a WhatsApp message, give us a call, or fill out the form. We respond fast and we never spam.
          </p>
          <div className="mt-8 space-y-4">
            <ContactRow label="WhatsApp & Calls" value={SITE.phoneDisplay} href={`tel:${SITE.phone}`} />
            <ContactRow label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
            <ContactRow label="Based in" value={SITE.city} />
          </div>
          <div className="mt-8">
            <WhatsAppButton size="lg" />
          </div>
        </div>
        <ServiceRequestForm />
      </section>
    </>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-4 hover:border-primary-bright transition">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-display font-extrabold text-primary">{value}</div>
      </div>
      {href && <ArrowRight className="size-4 text-primary-bright shrink-0" />}
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
