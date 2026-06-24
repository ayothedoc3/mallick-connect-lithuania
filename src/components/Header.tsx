import { Link } from "@tanstack/react-router";
import { Menu, X, Compass } from "lucide-react";
import { useState } from "react";
import { WhatsAppButton } from "./WhatsAppButton";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/accommodation", label: "Accommodation" },
  { to: "/hall-rentals", label: "Hall Rentals" },
  { to: "/import-export", label: "Import & Export" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="size-5" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="font-display text-base font-extrabold text-primary truncate">Mallick</span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Assist Service</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-foreground/80 rounded-full hover:bg-secondary hover:text-primary transition"
              activeProps={{ className: "bg-secondary text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <WhatsAppButton size="sm" label="WhatsApp" />
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden grid size-10 place-items-center rounded-lg border border-border text-primary"
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <WhatsAppButton className="mt-2 w-full" />
          </div>
        </div>
      )}
    </header>
  );
}
