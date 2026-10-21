import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, PlayCircle, Sparkles } from "lucide-react";
import { isFeatured, mediaUrl, priceLabel, sortedMedia, type Listing } from "@/lib/listings";

export const DETAIL_ROUTE = {
  item: "/marketplace/$id",
  service: "/services/$id",
  stay: "/accommodation/$id",
  hall: "/hall-rentals/$id",
} as const;

export function ListingCard({ listing, verified = false }: { listing: Listing; verified?: boolean }) {
  const media = sortedMedia(listing);
  const cover = media.find((m) => m.kind === "image");
  const hasVideo = media.some((m) => m.kind === "video");

  return (
    <Link
      to={DETAIL_ROUTE[listing.kind]}
      params={{ id: listing.id }}
      className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] bg-secondary">
        {cover ? (
          <img
            src={mediaUrl(cover.storage_path)}
            alt={listing.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">No photo</div>
        )}
        {isFeatured(listing) && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground shadow-soft">
            <Sparkles className="size-3.5" /> Featured
          </span>
        )}
        {hasVideo && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
            <PlayCircle className="size-3.5" /> Video
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          {listing.category}
          {verified && (
            <span className="inline-flex items-center gap-0.5 text-primary-bright">
              <BadgeCheck className="size-3.5" /> Verified
            </span>
          )}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-extrabold leading-tight text-primary">
          {listing.title}
        </h3>
        <p className="mt-2 font-display text-lg font-extrabold text-primary-bright">{priceLabel(listing)}</p>
        {listing.city && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {listing.city}
          </p>
        )}
      </div>
    </Link>
  );
}
