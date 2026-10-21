import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ListingCard } from "@/components/ListingCard";
import { SetupNotice } from "@/components/SetupNotice";
import { CATEGORIES, fetchPublishedListings } from "@/lib/listings";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Marketplace: buy and sell items in Lithuania | Mallick Assist Service" },
      {
        name: "description",
        content:
          "Browse items for sale from our community in Lithuania, or create an account and list your own with photos and video.",
      },
      { property: "og:title", content: "Marketplace | Mallick Assist Service" },
      { property: "og:url", content: "https://mallickassistservice.com/marketplace" },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/marketplace" }],
  }),
  loader: () => fetchPublishedListings(),
  component: MarketplacePage,
});

const inputCls =
  "rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

function MarketplacePage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const data = Route.useLoaderData();

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter(
      (l) =>
        (!category || l.category === category) &&
        (!term || `${l.title} ${l.description} ${l.city ?? ""}`.toLowerCase().includes(term)),
    );
  }, [data, q, category]);

  return (
    <>
      <PageHero
        eyebrow="Marketplace"
        title={<>Buy and sell with our community</>}
        subtitle="Items listed by people across Lithuania. Create a free account to list your own with photos and video."
      >
        <Link
          to="/sell"
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-soft hover:brightness-105"
        >
          Sell an item
        </Link>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <SetupNotice />
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search items"
              className={`${inputCls} w-full pl-10`}
              aria-label="Search items"
            />
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {items.length === 0 ? (
            <div className="rounded-3xl bg-secondary/70 p-10 text-center">
              <p className="font-display text-xl font-extrabold text-primary">
                {data.length ? "No items match your search" : "No items listed yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.length ? "Try a different word or category." : "Be the first to list something."}
              </p>
              <Link
                to="/sell"
                className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
              >
                Sell an item
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
