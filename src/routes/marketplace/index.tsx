import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { ListingBrowser } from "@/components/ListingBrowser";
import { SetupNotice } from "@/components/SetupNotice";
import { fetchPublishedListings } from "@/lib/listings";

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
  loader: () => fetchPublishedListings("item"),
  component: MarketplacePage,
});

function MarketplacePage() {
  const data = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Marketplace"
        title={<>Buy and sell with our community</>}
        subtitle="Items listed by people across Lithuania. Create a free account to list your own with photos and video."
      >
        <Link
          to="/sell"
          search={{ type: "item" }}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-soft hover:brightness-105"
        >
          Sell an item
        </Link>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <SetupNotice />
        <ListingBrowser kind="item" listings={data} />
      </section>
    </>
  );
}
