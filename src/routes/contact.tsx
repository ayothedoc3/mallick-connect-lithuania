import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Instagram, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mallick Assist Service" },
      { name: "description", content: "Get in touch with Mallick Assist Service via WhatsApp, phone, or email. Based in Lithuania, supporting the diaspora community." },
      { property: "og:title", content: "Contact Mallick Assist Service" },
      { property: "og:description", content: "Reach us on WhatsApp +370 624 34541 or fill out the service request form." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={<>One trusted contact for <span className="text-accent">everything you need</span></>}
        subtitle="WhatsApp is fastest — most messages answered within minutes during working hours."
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton size="lg" />
          <a
            href={`tel:${SITE.phone}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-white/10"
          >
            <Phone className="size-4" /> Call {SITE.phoneDisplay}
          </a>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
        <div className="grid gap-4">
          {[
            { icon: MessageCircle, label: "WhatsApp", value: SITE.phoneDisplay, href: `https://wa.me/37062434541` },
            { icon: Phone, label: "Phone", value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
            { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
            { icon: MapPin, label: "Based in", value: SITE.city },
            { icon: Instagram, label: "Instagram", value: "@mallickassistservice", href: SITE.instagram },
          ].map((c) => {
            const inner = (
              <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:border-primary-bright transition">
                <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary-bright shrink-0">
                  <c.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="mt-0.5 font-display font-extrabold text-primary truncate">{c.value}</div>
                </div>
              </div>
            );
            return c.href ? (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{inner}</a>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>
        <ServiceRequestForm title="Send us a request" />
      </section>
    </>
  );
}
