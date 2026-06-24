import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Instagram, Compass } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Compass className="size-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-extrabold">Mallick Assist Service</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
            Trusted support for accommodation, hall rentals, currency exchange, buying & selling,
            and import/export across Lithuania.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Services</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/accommodation" className="hover:text-accent">Accommodation</Link></li>
            <li><Link to="/hall-rentals" className="hover:text-accent">Hall Rentals</Link></li>
            <li><Link to="/import-export" className="hover:text-accent">Import & Export</Link></li>
            <li><Link to="/services" className="hover:text-accent">All Services</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <Phone className="size-4 mt-0.5 shrink-0 text-accent" />
              <a href={`tel:${SITE.phone}`} className="hover:text-accent">{SITE.phoneDisplay}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="size-4 mt-0.5 shrink-0 text-accent" />
              <a href={`mailto:${SITE.email}`} className="hover:text-accent break-all">{SITE.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0 text-accent" />
              <span>{SITE.city}</span>
            </li>
            <li className="flex items-start gap-2">
              <Instagram className="size-4 mt-0.5 shrink-0 text-accent" />
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-accent">@mallickassistservice</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-primary-foreground/60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Mallick Assist Service. All rights reserved.</span>
          <span>Made with care for our community in Lithuania.</span>
        </div>
      </div>
    </footer>
  );
}
