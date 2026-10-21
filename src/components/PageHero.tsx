import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface Props {
  /** Name of the current page, shown as a breadcrumb after "Home". */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="bg-hero relative overflow-hidden text-primary-foreground">
      <div className="absolute inset-0 bg-grid-soft opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        {eyebrow && (
          <nav aria-label="Breadcrumb" className="text-sm text-primary-foreground/70">
            <Link
              to="/"
              className="underline decoration-white/30 underline-offset-4 hover:text-accent"
            >
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span aria-current="page">{eyebrow}</span>
          </nav>
        )}
        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] max-w-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-primary-foreground/85">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
