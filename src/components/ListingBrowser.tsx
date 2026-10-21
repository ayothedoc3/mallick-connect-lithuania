import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES, SERVICE_CATEGORIES, type Listing, type ListingKind } from "@/lib/listings";

const inputCls =
  "rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

const COPY = {
  item: {
    categories: CATEGORIES,
    search: "Search items",
    noMatch: "No items match your search",
    empty: "No items listed yet",
    emptyHint: "Be the first to list something.",
    cta: "Sell an item",
  },
  service: {
    categories: SERVICE_CATEGORIES,
    search: "Search services, e.g. braids, catering",
    noMatch: "No services match your search",
    empty: "No services listed yet",
    emptyHint: "Braider, chef, photographer? Be the first to offer your service.",
    cta: "Offer your service",
  },
} as const;

/** Search, category filter and grid for approved listings of one kind. */
export function ListingBrowser({ kind, listings }: { kind: ListingKind; listings: Listing[] }) {
  const copy = COPY[kind];
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (!category || l.category === category) &&
        (!term ||
          `${l.title} ${l.description} ${l.category} ${l.city ?? ""}`.toLowerCase().includes(term)),
    );
  }, [listings, q, category]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.search}
            className={`${inputCls} w-full pl-10`}
            aria-label={copy.search}
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {copy.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {shown.length === 0 ? (
          <div className="rounded-3xl bg-secondary/70 p-10 text-center">
            <p className="font-display text-xl font-extrabold text-primary">
              {listings.length ? copy.noMatch : copy.empty}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {listings.length ? "Try a different word or category." : copy.emptyHint}
            </p>
            <Link
              to="/sell"
              search={{ type: kind }}
              className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
            >
              {copy.cta}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
