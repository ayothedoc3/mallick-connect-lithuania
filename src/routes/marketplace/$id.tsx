import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { SetupNotice } from "@/components/SetupNotice";
import { fetchListing, formatPrice, mediaUrl, sortedMedia } from "@/lib/listings";
import { useWaLink } from "@/lib/settings";
import { cn } from "@/lib/utils";

const SITE_URL = "https://mallickassistservice.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/marketplace/$id")({
  // Loaded on the server so search engines and link previews see the real item.
  loader: async ({ params }) => {
    if (!UUID.test(params.id)) throw notFound();
    const listing = await fetchListing(params.id);
    if (!listing) throw notFound();
    return listing;
  },
  head: ({ loaderData: listing }) => {
    if (!listing) return { meta: [{ title: "Item not found | Mallick Assist Service" }] };
    const url = `${SITE_URL}/marketplace/${listing.id}`;
    const cover = sortedMedia(listing).find((m) => m.kind === "image");
    const image = cover ? mediaUrl(cover.storage_path) : undefined;
    const title = `${listing.title} - ${formatPrice(listing.price_eur)} | Mallick Marketplace`;
    const description = listing.description.replace(/\s+/g, " ").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: listing.title,
            description: listing.description,
            category: listing.category,
            ...(image ? { image } : {}),
            offers: {
              "@type": "Offer",
              url,
              priceCurrency: "EUR",
              ...(listing.price_eur !== null ? { price: listing.price_eur } : {}),
              availability:
                listing.status === "sold"
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
              itemCondition:
                listing.condition === "New"
                  ? "https://schema.org/NewCondition"
                  : "https://schema.org/UsedCondition",
            },
          }),
        },
      ],
    };
  },
  component: ListingPage,
  notFoundComponent: ListingNotFound,
});

function ListingNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold text-primary">Item not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been removed, or it is still waiting for review.
      </p>
      <Link
        to="/marketplace"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
      >
        Back to marketplace
      </Link>
    </div>
  );
}

function ListingPage() {
  const listing = Route.useLoaderData();
  const waLink = useWaLink();
  const [active, setActive] = useState(0);

  const media = sortedMedia(listing);
  const current = media[Math.min(active, media.length - 1)];
  const sold = listing.status === "sold";
  const message = `Hello Mallick Assist Service, I'm interested in "${listing.title}" (${formatPrice(listing.price_eur)}). https://mallickassistservice.com/marketplace/${listing.id}`;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <SetupNotice />
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-bright hover:underline"
      >
        <ArrowLeft className="size-4" /> All items
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-secondary">
            {current ? (
              current.kind === "video" ? (
                <video
                  key={current.id}
                  src={mediaUrl(current.storage_path)}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[4/3] w-full bg-black object-contain"
                />
              ) : (
                <img
                  src={mediaUrl(current.storage_path)}
                  alt={listing.title}
                  className="aspect-[4/3] w-full object-contain"
                />
              )
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-sm text-muted-foreground">
                No photo
              </div>
            )}
          </div>

          {media.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${m.kind} ${i + 1}`}
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-secondary",
                    i === active ? "border-primary-bright" : "border-transparent",
                  )}
                >
                  {m.kind === "image" ? (
                    <img src={mediaUrl(m.storage_path)} alt="" className="size-full object-cover" />
                  ) : (
                    <video
                      src={`${mediaUrl(m.storage_path)}#t=0.1`}
                      preload="metadata"
                      muted
                      playsInline
                      className="size-full object-cover"
                    />
                  )}
                  {m.kind === "video" && (
                    <span className="absolute inset-x-0 bottom-0 bg-primary/80 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                      Video
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="font-display text-3xl font-extrabold text-primary">
            {formatPrice(listing.price_eur)}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold">{listing.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{listing.category}</span>
            {listing.condition && <span>Condition: {listing.condition}</span>}
            {listing.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {listing.city}
              </span>
            )}
          </p>

          {sold ? (
            <p className="mt-6 rounded-2xl bg-secondary p-4 text-sm font-semibold text-primary">
              This item has been sold.
            </p>
          ) : (
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold text-whatsapp-foreground shadow-soft hover:brightness-110"
            >
              <MessageCircle className="size-4" strokeWidth={2.5} /> Ask about this item on WhatsApp
            </a>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Messages go to Mallick Assist Service, who connect you with the seller.
          </p>

          <h2 className="mt-8 font-display text-lg font-extrabold text-primary">Description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {listing.description}
          </p>
          {listing.seller_name && (
            <p className="mt-6 text-xs text-muted-foreground">
              Listed by {listing.seller_name.split(" ")[0]}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
