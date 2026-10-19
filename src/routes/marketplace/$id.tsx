import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { SetupNotice } from "@/components/SetupNotice";
import { fetchListing, formatPrice, mediaUrl, sortedMedia } from "@/lib/listings";
import { useWaLink } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace/$id")({
  head: () => ({
    meta: [{ title: "Item for sale | Mallick Assist Service" }],
  }),
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const waLink = useWaLink();
  const [active, setActive] = useState(0);
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id),
  });

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (error || !listing) {
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

  const media = sortedMedia(listing);
  const current = media[Math.min(active, media.length - 1)];
  const sold = listing.status === "sold";
  const message = `Hello Mallick Assist Service, I'm interested in "${listing.title}" (${formatPrice(listing.price_eur)}). https://mallickassistservice.com/marketplace/${listing.id}`;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <SetupNotice />
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-bright hover:underline">
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
              <div className="grid aspect-[4/3] place-items-center text-sm text-muted-foreground">No photo</div>
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
                    <video src={`${mediaUrl(m.storage_path)}#t=0.1`} preload="metadata" muted playsInline className="size-full object-cover" />
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
          <p className="font-display text-3xl font-extrabold text-primary">{formatPrice(listing.price_eur)}</p>
          <h1 className="mt-1 font-display text-xl font-bold">{listing.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{listing.category}</span>
            {listing.condition && <span>Condition: {listing.condition}</span>}
            {listing.city && (
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {listing.city}</span>
            )}
          </p>

          {sold ? (
            <p className="mt-6 rounded-2xl bg-secondary p-4 text-sm font-semibold text-primary">This item has been sold.</p>
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
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{listing.description}</p>
          {listing.seller_name && (
            <p className="mt-6 text-xs text-muted-foreground">Listed by {listing.seller_name.split(" ")[0]}</p>
          )}
        </div>
      </div>
    </section>
  );
}
