import { useState } from "react";
import { Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, MapPin, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Stars } from "@/components/Stars";
import { fetchProviderPage } from "@/lib/providers";
import { SetupNotice } from "@/components/SetupNotice";
import {
  fetchListing,
  mediaUrl,
  priceLabel,
  sortedMedia,
  type Listing,
  type ListingKind,
} from "@/lib/listings";
import { useSiteSettings, useWaLink } from "@/lib/settings";
import { BookingWidget } from "@/components/BookingWidget";
import { cn } from "@/lib/utils";

const SITE_URL = "https://mallickassistservice.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COPY = {
  item: {
    base: "/marketplace",
    back: "All items",
    backLong: "Back to marketplace",
    noun: "item",
    party: "seller",
    by: "Listed by",
    gone: "This item has been sold.",
    titleSuffix: "Mallick Marketplace",
  },
  service: {
    base: "/services",
    back: "All services",
    backLong: "Back to services",
    noun: "service",
    party: "provider",
    by: "Offered by",
    gone: "This service is no longer available.",
    titleSuffix: "Local services in Vilnius",
  },
  stay: {
    base: "/accommodation",
    back: "All stays",
    backLong: "Back to accommodation",
    noun: "stay",
    party: "host",
    by: "Hosted with",
    gone: "This stay is no longer available.",
    titleSuffix: "Accommodation in Vilnius",
  },
  hall: {
    base: "/hall-rentals",
    back: "All halls",
    backLong: "Back to hall rentals",
    noun: "hall",
    party: "venue",
    by: "Managed by",
    gone: "This hall is no longer available.",
    titleSuffix: "Event halls in Vilnius",
  },
} as const;

export function listingUrl(l: Pick<Listing, "id" | "kind">) {
  return `${SITE_URL}${COPY[l.kind].base}/${l.id}`;
}

/** Route loader: the listing, or a 404 if it's missing, not yet approved, or the other kind. */
export async function loadListing(kind: ListingKind, id: string) {
  if (!UUID.test(id)) throw notFound();
  const listing = await fetchListing(id);
  if (!listing || listing.kind !== kind) throw notFound();
  return listing;
}

/** Page title, preview metadata and structured data for search engines. */
export function listingHead(kind: ListingKind, listing: Listing | undefined) {
  const copy = COPY[kind];
  if (!listing) return { meta: [{ title: `Not found | Mallick Assist Service` }] };
  const url = listingUrl(listing);
  const cover = sortedMedia(listing).find((m) => m.kind === "image");
  const image = cover ? mediaUrl(cover.storage_path) : undefined;
  const title = `${listing.title} - ${priceLabel(listing)} | ${copy.titleSuffix}`;
  const description = listing.description.replace(/\s+/g, " ").slice(0, 155);
  const offer = {
    "@type": "Offer",
    url,
    priceCurrency: "EUR",
    ...(listing.price_eur !== null ? { price: listing.price_eur } : {}),
  };
  const structured =
    kind === "item"
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: listing.title,
          description: listing.description,
          category: listing.category,
          ...(image ? { image } : {}),
          offers: {
            ...offer,
            availability:
              listing.status === "sold"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            itemCondition:
              listing.condition === "New"
                ? "https://schema.org/NewCondition"
                : "https://schema.org/UsedCondition",
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "Service",
          name: listing.title,
          description: listing.description,
          serviceType: listing.category,
          areaServed: listing.city || "Vilnius",
          ...(image ? { image } : {}),
          offers: offer,
        };
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: kind === "item" ? "product" : "website" },
      ...(image
        ? [
            { property: "og:image", content: image },
            { name: "twitter:image", content: image },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(structured) }],
  };
}

export function ListingNotFound({ kind }: { kind: ListingKind }) {
  const copy = COPY[kind];
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold text-primary">
        {kind === "item" ? "Item" : "Service"} not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been removed, or it is still waiting for review.
      </p>
      <Link
        to={copy.base}
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
      >
        {copy.backLong}
      </Link>
    </div>
  );
}

export function ListingDetail({ listing }: { listing: Listing }) {
  const copy = COPY[listing.kind];
  const waLink = useWaLink();
  const [active, setActive] = useState(0);

  const media = sortedMedia(listing);
  const current = media[Math.min(active, media.length - 1)];
  const gone = listing.status === "sold";
  const site = useSiteSettings();
  const canBook =
    (listing.kind === "stay" || listing.kind === "hall") &&
    site.payments_enabled &&
    listing.price_eur !== null &&
    Boolean(listing.deposit_eur);
  const message = `Hello Mallick Assist Service, I'm interested in the ${copy.noun} "${listing.title}" (${priceLabel(listing)}). ${listingUrl(listing)}`;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <SetupNotice />
      <Link
        to={copy.base}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-bright hover:underline"
      >
        <ArrowLeft className="size-4" /> {copy.back}
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
          <p className="font-display text-3xl font-extrabold text-primary">{priceLabel(listing)}</p>
          <h1 className="mt-1 font-display text-xl font-bold">{listing.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{listing.category}</span>
            {listing.condition && <span>Condition: {listing.condition}</span>}
            {listing.capacity && <span>Up to {listing.capacity} guests</span>}
            {listing.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {listing.city}
              </span>
            )}
          </p>

          {gone ? (
            <p className="mt-6 rounded-2xl bg-secondary p-4 text-sm font-semibold text-primary">
              {copy.gone}
            </p>
          ) : (
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold text-whatsapp-foreground shadow-soft hover:brightness-110"
            >
              <MessageCircle className="size-4" strokeWidth={2.5} /> Ask about this {copy.noun} on
              WhatsApp
            </a>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Messages go to Mallick Assist Service, who connect you with the {copy.party}.
          </p>
          {!gone && canBook && <BookingWidget listing={listing} />}

          <h2 className="mt-8 font-display text-lg font-extrabold text-primary">Description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {listing.description}
          </p>
          {listing.kind === "service" ? (
            <ProviderCard userId={listing.user_id} />
          ) : (
            listing.seller_name &&
            listing.kind === "item" && (
              <p className="mt-6 text-xs text-muted-foreground">
                {copy.by} {listing.seller_name.split(" ")[0]}
              </p>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function ProviderCard({ userId }: { userId: string }) {
  const q = useQuery({ queryKey: ["provider", userId], queryFn: () => fetchProviderPage(userId) });
  if (!q.data) return null;
  const { profile, rating } = q.data;
  return (
    <Link
      to="/pros/$id"
      params={{ id: userId }}
      className="mt-8 flex items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg font-extrabold text-accent">
        {profile.display_name.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-display font-extrabold text-primary">
          {profile.display_name}
          {profile.verified && <BadgeCheck className="size-4 text-primary-bright" aria-label="Verified by Mallick" />}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {rating ? (
            <>
              <Stars value={Number(rating.average)} /> {Number(rating.average).toFixed(1)} ({rating.count})
            </>
          ) : (
            "No reviews yet"
          )}
          <span className="font-semibold text-primary-bright">See profile and reviews</span>
        </span>
      </span>
    </Link>
  );
}
