import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Clock, HeartHandshake, MapPin, Quote, ShoppingBag, Tag } from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { ListingCard } from "@/components/ListingCard";
import { FounderVideo } from "@/components/FounderVideo";
import { fetchPublishedListings, isFeatured } from "@/lib/listings";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SERVICES } from "@/lib/site";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mallick Assist Service | Support Services in Lithuania" },
      { name: "description", content: "Trusted support for accommodation, hall rentals, currency exchange, buying & selling, and import/export in Lithuania. One contact for everything you need." },
      { property: "og:title", content: "Mallick Assist Service | Trusted Support in Lithuania" },
      { property: "og:description", content: "One trusted contact for accommodation, hall rentals, exchange, trade and shipping in Lithuania." },
      { property: "og:url", content: "https://mallickassistservice.com/" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Mallick Assist Service",
          description: "Support and concierge service helping migrants, students, and diaspora communities in Lithuania with accommodation, hall rentals, currency exchange, buying and selling, and import/export.",
          telephone: "+37062434541",
          url: "https://mallickassistservice.com/",
          address: { "@type": "PostalAddress", addressCountry: "LT", addressLocality: "Vilnius" },
          areaServed: "Lithuania",
        }),
      },
    ],
  }),
  // Featured items first, then the newest.
  loader: async () =>
    (await fetchPublishedListings("item", 12))
      .sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)))
      .slice(0, 4),
  component: Home,
});

const TONES = ["navy", "blue", "yellow", "blue", "light", "navy"] as const;

const SERVICE_LINKS = [
  { to: "/short-term-accommodation", label: "Short stays" },
  { to: "/long-term-accommodation", label: "Long-term housing" },
  { to: "/hall-rentals", label: "Event halls" },
  { to: "/currency-exchange", label: "Currency exchange" },
  { to: "/import-export", label: "Import & export" },
] as const;

const STEPS = [
  { title: "Tell us what you need", text: "Send a WhatsApp message or fill in the short form below." },
  { title: "We confirm options", text: "We check availability and send you trusted options to choose from." },
  { title: "We stay with you", text: "We're with you from the first message until everything is settled." },
];

const REASONS = [
  { icon: HeartHandshake, t: "Trusted by community", d: "Recommended across diaspora networks." },
  { icon: MapPin, t: "Local Lithuania support", d: "On-the-ground knowledge in every city." },
  { icon: Clock, t: "Fast response", d: "Most WhatsApp messages answered within minutes." },
  { icon: Sparkles, t: "Diaspora-friendly", d: "We speak your language, literally and figuratively." },
];

const TESTIMONIALS = [
  { q: "They found me a great short-stay in Vilnius the same day I arrived. I felt cared for from minute one.", n: "Amaka O.", r: "New arrival, Vilnius" },
  { q: "Organized our wedding hall, decorations, and even helped with the currency exchange. One contact for everything.", n: "Ravi & Priya", r: "Wedding, Kaunas" },
  { q: "Shipped a container back home without stress. They handled paperwork I had no idea about.", n: "Samuel K.", r: "Import/Export client" },
];

const h2 = "font-display text-3xl sm:text-4xl font-extrabold text-primary";

function Home() {
  const site = useSiteSettings();
  const latest = Route.useLoaderData();
  return (
    <>
      {/* HERO */}
      <section className="bg-hero relative overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 bg-grid-soft opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
          <div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.02]">
              Your trusted contact in Lithuania
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
              Housing, event halls, currency exchange and shipping for students, families and the
              diaspora. Message us on WhatsApp and we'll handle the rest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppButton size="lg" />
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3.5 text-base font-semibold hover:bg-white/10"
              >
                <ShoppingBag className="size-4" /> Browse the marketplace
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {SERVICE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-primary-foreground/80 underline decoration-white/30 underline-offset-4 hover:text-accent hover:decoration-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <figure className="relative mx-auto w-full max-w-[300px] lg:mr-0 lg:max-w-[340px]">
            <div className="absolute -top-6 -right-6 size-56 rounded-full bg-accent/30 blur-3xl" />
            <FounderVideo
              video="mission"
              preview
              label="Precious, our founder, on helping African students settle into Vilnius"
              className="relative"
            />
            <figcaption className="relative mt-4 text-center text-sm text-primary-foreground/80">
              Precious, our founder, on helping students settle into Vilnius
            </figcaption>
          </figure>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className={h2}>Six services. One trusted contact.</h2>
          <p className="max-w-md text-muted-foreground">
            From your first night in Lithuania to shipping goods home. We handle the details so you don't have to.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.slug} title={s.title} description={s.short} icon={s.icon} tone={TONES[i]} href={`/${s.slug}`} />
          ))}
        </div>
        <p className="mt-8 text-muted-foreground">
          Looking for a braider, chef or photographer?{" "}
          <Link
            to="/services"
            hash="local-pros"
            className="font-semibold text-primary underline decoration-border underline-offset-4 hover:decoration-primary"
          >
            Find a local pro in Vilnius
          </Link>
        </p>
      </section>

      {/* MARKETPLACE */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">Buy and sell with our community</h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">
              Furniture, electronics, kitchen items and more from people across Lithuania.
              Listing is free: add photos, a price and you're done.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-soft hover:brightness-105"
              >
                <ShoppingBag className="size-4" /> Browse all items
              </Link>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3.5 text-sm font-bold hover:bg-white/10"
              >
                <Tag className="size-4" /> Sell an item
              </Link>
            </div>
          </div>
          {latest.length > 0 ? (
            <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 text-foreground sm:mx-0 sm:px-0">
              {latest.map((l) => (
                <li key={l.id} className="w-60 shrink-0 snap-start">
                  <ListingCard listing={l} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl border border-white/15 p-10 text-center text-primary-foreground/75">
              No items listed yet. Be the first to sell something.
            </p>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className={h2}>How it works</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-primary pt-5">
                <span className="font-display text-sm font-extrabold text-primary-bright">Step {i + 1}</span>
                <h3 className="mt-1 font-display text-xl font-extrabold text-primary">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
        <div>
          <h2 className={h2}>Built on trust. Powered by community.</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            We're not a faceless agency. We're part of the diaspora community in Lithuania,
            and we treat every request like it's for family.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {REASONS.map((f) => (
              <li key={f.t} className="flex gap-3">
                <f.icon className="mt-0.5 size-6 shrink-0 rounded-lg bg-accent p-1 text-accent-foreground" />
                <div>
                  <p className="font-display font-extrabold text-primary">{f.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {[["500+", "Clients helped"], ["6", "Services"], ["24/7", "On WhatsApp"]].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-3xl sm:text-4xl font-extrabold text-primary">{n}</dd>
                <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="mx-auto w-full max-w-[320px]">
          <FounderVideo video="intro" label="A message from Precious, our founder" />
          <figcaption className="mt-4 text-center text-sm text-muted-foreground">
            A message from Precious, our founder
          </figcaption>
        </figure>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className={h2}>What our community says</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.n} className="rounded-3xl bg-card p-7 border border-border">
                <Quote className="size-7 text-accent" />
                <blockquote className="mt-3 text-foreground/90">"{t.q}"</blockquote>
                <figcaption className="mt-5">
                  <div className="font-bold text-primary">{t.n}</div>
                  <div className="text-sm text-muted-foreground">{t.r}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
        <div>
          <h2 className={h2}>Let's talk about what you need</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Send a WhatsApp message, give us a call, or fill in the form. We respond fast and we never spam.
          </p>
          <dl className="mt-8 grid gap-5">
            <ContactRow label="WhatsApp and calls" value={site.phone_display} href={`tel:${site.phone}`} />
            <ContactRow label="Based in" value={site.city} />
            <ContactRow label="TikTok" value={site.tiktok_handle} href={site.tiktok_url} />
          </dl>
        </div>
        <ServiceRequestForm />
      </section>
    </>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-extrabold text-primary">
        {href ? (
          <a href={href} className="underline decoration-border underline-offset-4 hover:decoration-primary-bright">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
