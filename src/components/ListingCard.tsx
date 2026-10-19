import { Link } from "@tanstack/react-router";
import { MapPin, PlayCircle } from "lucide-react";
import { formatPrice, mediaUrl, sortedMedia, type Listing } from "@/lib/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  const media = sortedMedia(listing);
  const cover = media.find((m) => m.kind === "image");
  const hasVideo = media.some((m) => m.kind === "video");

  return (
    <Link
      to="/marketplace/$id"
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
        {hasVideo && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
            <PlayCircle className="size-3.5" /> Video
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{listing.category}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-extrabold leading-tight text-primary">
          {listing.title}
        </h3>
        <p className="mt-2 font-display text-lg font-extrabold text-primary-bright">{formatPrice(listing.price_eur)}</p>
        {listing.city && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {listing.city}
          </p>
        )}
      </div>
    </Link>
  );
}
