import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, MessageCircle, PlayCircle, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DETAIL_ROUTE } from "@/components/ListingCard";
import {
  deleteListing,
  fetchAllListings,
  isFeatured,
  setFeaturedUntil,
  fetchProfiles,
  priceLabel,
  mediaUrl,
  setListingStatus,
  sortedMedia,
  type Listing,
  type ListingKind,
  type ListingStatus,
} from "@/lib/listings";
import { fetchProviderBadges, setProviderVerified } from "@/lib/providers";
import { useSiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const FILTERS: { id: ListingStatus | "all"; label: string }[] = [
  { id: "pending", label: "Waiting for review" },
  { id: "published", label: "Live" },
  { id: "sold", label: "Sold" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const STATUS_CLS: Record<ListingStatus, string> = {
  pending: "bg-accent/30 text-primary",
  published: "bg-whatsapp/20 text-primary",
  sold: "bg-secondary text-muted-foreground",
  rejected: "bg-destructive/15 text-destructive",
};

const btn =
  "rounded-full border border-input px-3 py-1.5 font-semibold hover:border-primary-bright disabled:opacity-60";

const KIND_FILTERS: { id: ListingKind | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "item", label: "Items" },
  { id: "service", label: "Services" },
  { id: "stay", label: "Stays" },
  { id: "hall", label: "Halls" },
];

const DAY = 86_400_000;

export function ListingsTab() {
  const [filter, setFilter] = useState<ListingStatus | "all">("pending");
  const [kindFilter, setKindFilter] = useState<ListingKind | "all">("all");
  const queryClient = useQueryClient();
  const site = useSiteSettings();

  const listings = useQuery({ queryKey: ["admin", "listings"], queryFn: fetchAllListings });
  const sellerIds = [...new Set((listings.data ?? []).map((l) => l.user_id))];
  const profiles = useQuery({
    queryKey: ["admin", "profiles", sellerIds],
    queryFn: () => fetchProfiles(sellerIds),
    enabled: listings.isSuccess,
  });

  const providerIds = [
    ...new Set((listings.data ?? []).filter((l) => l.kind === "service").map((l) => l.user_id)),
  ];
  const badges = useQuery({
    queryKey: ["admin", "provider-badges", providerIds],
    queryFn: () => fetchProviderBadges(providerIds),
    enabled: listings.isSuccess,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
  };

  const featured = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      setFeaturedUntil(id, on ? new Date(Date.now() + site.feature_days * DAY) : null),
    onSuccess: () => {
      toast.success("Featured placement updated.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });

  const verify = useMutation({
    mutationFn: ({ userId, on }: { userId: string; on: boolean }) => setProviderVerified(userId, on),
    onSuccess: () => {
      toast.success("Provider updated.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });

  const status = useMutation({
    mutationFn: ({ id, to }: { id: string; to: ListingStatus }) => setListingStatus(id, to),
    onSuccess: () => {
      toast.success("Listing updated.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the listing."),
  });

  const remove = useMutation({
    mutationFn: (l: Listing) => deleteListing(l),
    onSuccess: () => {
      toast.success("Listing deleted.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete the listing."),
  });

  if (listings.isLoading) return <p className="text-sm text-muted-foreground">Loading listings…</p>;
  if (listings.error)
    return <p className="text-sm text-destructive">{(listings.error as Error).message}</p>;

  const all = (listings.data ?? []).filter((l) => kindFilter === "all" || l.kind === kindFilter);
  const count = (id: ListingStatus | "all") =>
    id === "all" ? all.length : all.filter((l) => l.status === id).length;
  const shown = filter === "all" ? all : all.filter((l) => l.status === filter);
  const busy = status.isPending || remove.isPending || featured.isPending || verify.isPending;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full bg-secondary p-1">
          {KIND_FILTERS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKindFilter(k.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                kindFilter === k.id ? "bg-background text-primary shadow-soft" : "text-primary/70",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Link to="/sell" search={{ type: "stay" }} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-bright">
            <Plus className="size-3.5" /> Add a stay
          </Link>
          <Link to="/sell" search={{ type: "hall" }} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-bright">
            <Plus className="size-3.5" /> Add a hall
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary-bright",
            )}
          >
            {f.label} <span className="opacity-70">({count(f.id)})</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {shown.length === 0 && (
          <p className="rounded-3xl bg-secondary/70 p-10 text-center text-sm text-muted-foreground">
            Nothing here.
          </p>
        )}
        {shown.map((l) => {
          const media = sortedMedia(l);
          const seller = profiles.data?.[l.user_id];
          const sellerPhone = seller?.whatsapp?.replace(/\D/g, "");
          return (
            <article
              key={l.id}
              className="rounded-3xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={cn("rounded-full px-2.5 py-1 font-semibold", STATUS_CLS[l.status])}
                >
                  {l.status}
                </span>
                <span className="text-muted-foreground">
                  {new Date(l.created_at).toLocaleString()}
                </span>
                <span className="rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground">
                  {{ item: "Item", service: "Service", stay: "Stay", hall: "Hall" }[l.kind]}
                </span>
                {isFeatured(l) && (
                  <span className="rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-foreground">
                    Featured until {new Date(l.featured_until!).toLocaleDateString()}
                  </span>
                )}
                {badges.data?.[l.user_id]?.verified && l.kind === "service" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-bright/15 px-2.5 py-1 font-semibold text-primary">
                    <BadgeCheck className="size-3.5" /> Verified
                  </span>
                )}
                <span className="text-muted-foreground">· {l.category}</span>
                {l.condition && <span className="text-muted-foreground">· {l.condition}</span>}
                {l.city && <span className="text-muted-foreground">· {l.city}</span>}
              </div>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-extrabold text-primary">{l.title}</h2>
                <p className="font-display text-lg font-extrabold text-primary-bright">
                  {priceLabel(l)}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {l.description}
              </p>

              {media.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {media.map((m) =>
                    m.kind === "image" ? (
                      <a
                        key={m.id}
                        href={mediaUrl(m.storage_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0"
                      >
                        <img
                          src={mediaUrl(m.storage_path)}
                          alt=""
                          className="size-24 rounded-xl object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        key={m.id}
                        href={mediaUrl(m.storage_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="grid size-24 shrink-0 place-items-center rounded-xl bg-black text-xs font-semibold text-white"
                      >
                        <span className="flex flex-col items-center gap-1">
                          <PlayCircle className="size-6" /> Video
                        </span>
                      </a>
                    ),
                  )}
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-secondary/70 p-3 text-sm">
                <span className="font-semibold text-primary">Seller:</span>{" "}
                {seller?.display_name || l.seller_name || "Unknown"}
                {seller?.whatsapp && (
                  <>
                    {" · "}
                    <a
                      href={`https://wa.me/${sellerPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary-bright hover:underline"
                    >
                      <MessageCircle className="size-3.5" /> {seller.whatsapp}
                    </a>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {l.status !== "published" && (
                  <button
                    disabled={busy}
                    onClick={() => status.mutate({ id: l.id, to: "published" })}
                    className="rounded-full bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:bg-primary-bright disabled:opacity-60"
                  >
                    {l.status === "pending" ? "Approve & publish" : "Publish"}
                  </button>
                )}
                {l.status !== "rejected" && l.status !== "sold" && (
                  <button
                    disabled={busy}
                    onClick={() => status.mutate({ id: l.id, to: "rejected" })}
                    className={btn}
                  >
                    Reject
                  </button>
                )}
                {l.status === "published" && (
                  <button
                    disabled={busy}
                    onClick={() => status.mutate({ id: l.id, to: "sold" })}
                    className={btn}
                  >
                    {l.kind === "service" ? "Mark unavailable" : "Mark sold"}
                  </button>
                )}
                {l.status !== "pending" && (
                  <button
                    disabled={busy}
                    onClick={() => status.mutate({ id: l.id, to: "pending" })}
                    className={btn}
                  >
                    Back to review
                  </button>
                )}
                {(l.status === "published" || l.status === "sold") && (
                  <Link to={DETAIL_ROUTE[l.kind]} params={{ id: l.id }} className={btn}>
                    View on site
                  </Link>
                )}
                {(l.kind === "stay" || l.kind === "hall") && (
                  <Link to="/sell" search={{ edit: l.id }} className={btn}>
                    Edit
                  </Link>
                )}
                {l.status === "published" && (l.kind === "item" || l.kind === "service") && (
                  <button
                    disabled={busy}
                    onClick={() => featured.mutate({ id: l.id, on: !isFeatured(l) })}
                    className={cn(btn, "inline-flex items-center gap-1")}
                  >
                    <Sparkles className="size-3.5" />
                    {isFeatured(l) ? "Remove featured" : `Feature ${site.feature_days} days free`}
                  </button>
                )}
                {l.kind === "service" && badges.data?.[l.user_id] && (
                  <button
                    disabled={busy}
                    onClick={() => verify.mutate({ userId: l.user_id, on: !badges.data[l.user_id].verified })}
                    className={cn(btn, "inline-flex items-center gap-1")}
                  >
                    <BadgeCheck className="size-3.5" />
                    {badges.data[l.user_id].verified ? "Remove Verified badge" : "Verify provider"}
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete "${l.title}" and all its photos and videos?`))
                      remove.mutate(l);
                  }}
                  className="rounded-full border border-destructive/40 px-3 py-1.5 font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
