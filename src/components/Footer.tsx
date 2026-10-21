import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Compass } from "lucide-react";
import { useSiteSettings } from "@/lib/settings";
import { resetCookieConsent } from "@/lib/consent";
import { TikTokIcon } from "@/components/icons";

export function Footer() {
  const site = useSiteSettings();
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
          <h4 className="font-display text-base font-extrabold text-accent">Services</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/short-term-accommodation" className="hover:text-accent">Short Term Accommodation</Link></li>
            <li><Link to="/long-term-accommodation" className="hover:text-accent">Long Term Accommodation</Link></li>
            <li><Link to="/currency-exchange" className="hover:text-accent">Currency Exchange</Link></li>
            <li><Link to="/hall-rentals" className="hover:text-accent">Hall Rentals</Link></li>
            <li><Link to="/buying-selling" className="hover:text-accent">Buying & Selling</Link></li>
            <li><Link to="/marketplace" className="hover:text-accent">Marketplace</Link></li>
            <li><Link to="/import-export" className="hover:text-accent">Import & Export</Link></li>
            <li><Link to="/services" className="hover:text-accent">Local pros</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-extrabold text-accent">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <Phone className="size-4 mt-0.5 shrink-0 text-accent" />
              <a href={`tel:${site.phone}`} className="hover:text-accent">{site.phone_display}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0 text-accent" />
              <span>{site.city}</span>
            </li>
            <li className="flex items-start gap-2">
              <TikTokIcon className="size-4 mt-0.5 shrink-0 text-accent" />
              <a href={site.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-accent">{site.tiktok_handle}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-primary-foreground/60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Mallick Assist Service. All rights reserved.</span>
          <span className="flex flex-wrap gap-4">
            {site.ga_measurement_id && (
              <button onClick={resetCookieConsent} className="underline hover:text-accent">
                Cookie settings
              </button>
            )}
            <span>Made with care for our community in Lithuania.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
