import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Video, X } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import {
  CATEGORIES,
  CONDITIONS,
  HALL_CATEGORIES,
  LIMITS,
  PRICE_UNITS,
  SERVICE_CATEGORIES,
  STAY_CATEGORIES,
  createListing,
  mediaUrl,
  sortedMedia,
  updateListing,
  validateFiles,
  type Listing,
  type ListingKind,
  type ListingMedia,
  type PriceUnit,
} from "@/lib/listings";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

export const FORM_COPY = {
  item: {
    eyebrow: "Marketplace",
    heading: "Sell an item",
    subtitle:
      "Add photos, an optional video and a description. We review every listing before it goes live.",
    title: "Title",
    titleHint: "e.g. IKEA desk, white, 120 cm",
    categories: CATEGORIES as readonly string[],
    price: "Price (EUR)",
    city: "City",
    cityHint: "Vilnius, Kaunas…",
    description: "Size, age, any damage, why you're selling, pickup details…",
    photos: "Photos",
  },
  service: {
    eyebrow: "Services",
    heading: "Offer your service",
    subtitle:
      "Braiding, cooking, photography or anything else you do. Show your work with photos and a short video. We review every listing before it goes live.",
    title: "Service name",
    titleHint: "e.g. Knotless braids, any length",
    categories: SERVICE_CATEGORIES as readonly string[],
    price: "Starting price (EUR)",
    city: "Where you work",
    cityHint: "e.g. Vilnius, or I come to you",
    description: "What's included, how long it takes, where you work, when you're available…",
    photos: "Photos of your work",
  },
  stay: {
    eyebrow: "Accommodation",
    heading: "Add a stay",
    subtitle: "Staff only. Stays go live straight away and can be booked online with a deposit.",
    title: "Name",
    titleHint: "e.g. Bright studio near Gedimino prospektas",
    categories: STAY_CATEGORIES as readonly string[],
    price: "Price per night (EUR)",
    city: "Area",
    cityHint: "e.g. Naujamiestis, Vilnius",
    description: "Beds, what's included, house rules, check-in and check-out times…",
    photos: "Photos",
  },
  hall: {
    eyebrow: "Hall Rentals",
    heading: "Add a hall",
    subtitle: "Staff only. Halls go live straight away and can be booked online with a deposit.",
    title: "Name",
    titleHint: "e.g. Riverside event hall",
    categories: HALL_CATEGORIES as readonly string[],
    price: "Price per day (EUR)",
    city: "Address or area",
    cityHint: "e.g. Užupis, Vilnius",
    description: "Layout, equipment, catering options, opening hours, decoration rules…",
    photos: "Photos",
  },
} as const;

const bookable = (k: ListingKind) => k === "stay" || k === "hall";

interface Props {
  kind: ListingKind;
  user: User;
  isStaff: boolean;
  /** Set when editing an existing listing. */
  listing?: Listing;
  /** Rendered above the fields, e.g. the item/service switch. */
  header?: ReactNode;
}

export function ListingForm({ kind, user, isStaff, listing, header }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const copy = FORM_COPY[kind];

  const [form, setForm] = useState({
    title: listing?.title ?? "",
    category: listing?.category ?? "",
    condition: listing?.condition ?? "",
    price: listing?.price_eur?.toString() ?? "",
    priceUnit: (listing?.price_unit ?? "") as PriceUnit | "",
    city: listing?.city ?? "",
    description: listing?.description ?? "",
    capacity: listing?.capacity?.toString() ?? "",
    deposit: listing?.deposit_eur?.toString() ?? "",
  });
  const existing = useMemo(() => (listing ? sortedMedia(listing) : []), [listing]);
  const [removed, setRemoved] = useState<ListingMedia[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const kept = existing.filter((m) => !removed.some((r) => r.id === m.id));
  const keptImages = kept.filter((m) => m.kind === "image");
  const keptVideos = kept.filter((m) => m.kind === "video");

  const imagePreviews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => () => imagePreviews.forEach((u) => URL.revokeObjectURL(u)), [imagePreviews]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function addFiles(type: "image" | "video", list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const count =
      type === "image" ? keptImages.length + images.length : keptVideos.length + videos.length;
    const max = type === "image" ? LIMITS.maxImages : LIMITS.maxVideos;
    if (count + incoming.length > max) {
      toast.error(`You can add up to ${max} ${type === "image" ? "photos" : "videos"}.`);
      return;
    }
    const problem = validateFiles(incoming, type);
    if (problem) {
      toast.error(problem);
      return;
    }
    if (type === "image") setImages([...images, ...incoming]);
    else setVideos([...videos, ...incoming]);
  }

  const number = (v: string) => (v.trim() === "" ? null : Number(v));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.category) return toast.error("Please choose a category.");
    if (keptImages.length + images.length === 0) return toast.error("Add at least one photo.");
    const price = number(form.price);
    if (price !== null && (!Number.isFinite(price) || price < 0))
      return toast.error("Enter a valid price in EUR.");
    const capacity = bookable(kind) ? number(form.capacity) : null;
    const deposit = bookable(kind) ? number(form.deposit) : null;
    if (bookable(kind)) {
      if (price === null) return toast.error("Enter the price.");
      if (!capacity || !Number.isInteger(capacity) || capacity < 1)
        return toast.error("Enter how many guests fit.");
      if (deposit === null || !(deposit > 0)) return toast.error("Enter the deposit paid online.");
    }
    const fields = {
      title: form.title.trim(),
      description: form.description.trim(),
      priceEur: price,
      priceUnit:
        kind === "stay"
          ? ("night" as const)
          : kind === "hall"
            ? ("day" as const)
            : kind === "service" && form.priceUnit
              ? form.priceUnit
              : null,
      category: form.category,
      condition: kind === "item" ? form.condition : "",
      city: form.city.trim(),
      capacity,
      depositEur: deposit,
    };
    setBusy(true);
    try {
      const onProgress = (done: number, total: number) => setProgress({ done, total });
      if (listing) {
        await updateListing(
          listing,
          { ...fields, removed, images, videos, keepStatus: isStaff },
          onProgress,
        );
        toast.success(
          isStaff ? "Saved." : "Saved. We'll review the changes and put it live again shortly.",
        );
      } else {
        await createListing(
          {
            ...fields,
            kind,
            userId: user.id,
            sellerName: (user.user_metadata?.display_name as string | undefined) ?? "",
            images,
            videos,
            publish: isStaff && bookable(kind),
          },
          onProgress,
        );
        toast.success(
          bookable(kind)
            ? "Published."
            : "Submitted! We'll review your listing and publish it shortly.",
        );
      }
      await queryClient.invalidateQueries();
      if (bookable(kind)) navigate({ to: "/precious", search: { tab: "listings" } });
      else navigate({ to: "/my-listings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Saving failed. Please try again.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  const field = (label: string, child: ReactNode, required = false) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
        {required && " *"}
      </span>
      {child}
    </label>
  );

  const category = field(
    "Category",
    <select required value={form.category} onChange={set("category")} className={inputCls}>
      <option value="">Select…</option>
      {copy.categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>,
    true,
  );
  const city = field(
    copy.city,
    <input
      maxLength={60}
      value={form.city}
      onChange={set("city")}
      className={inputCls}
      placeholder={copy.cityHint}
    />,
    bookable(kind),
  );
  const price = field(
    copy.price,
    <input
      inputMode="decimal"
      required={bookable(kind)}
      value={form.price}
      onChange={set("price")}
      className={inputCls}
      placeholder={bookable(kind) ? "e.g. 60" : "Leave empty for price on request"}
    />,
    bookable(kind),
  );

  const grid: Record<ListingKind, ReactNode[]> = {
    item: [
      category,
      field(
        "Condition",
        <select value={form.condition} onChange={set("condition")} className={inputCls}>
          <option value="">Select…</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>,
      ),
      price,
      city,
    ],
    service: [
      category,
      city,
      price,
      field(
        "Price is charged",
        <select value={form.priceUnit} onChange={set("priceUnit")} className={inputCls}>
          <option value="">Select…</option>
          {(["hour", "session", "person", "job"] as const).map((k) => (
            <option key={k} value={k}>
              {PRICE_UNITS[k]}
            </option>
          ))}
        </select>,
      ),
    ],
    stay: [],
    hall: [],
  };
  const bookableFields = [
    category,
    city,
    price,
    field(
      "Guests (maximum)",
      <input
        required
        type="number"
        min={1}
        value={form.capacity}
        onChange={set("capacity")}
        className={inputCls}
      />,
      true,
    ),
    field(
      "Deposit paid online (EUR)",
      <input
        required
        inputMode="decimal"
        value={form.deposit}
        onChange={set("deposit")}
        className={inputCls}
        placeholder="e.g. 50"
      />,
      true,
    ),
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border grid gap-5"
    >
      {header}

      {field(
        copy.title,
        <input
          required
          minLength={3}
          maxLength={120}
          value={form.title}
          onChange={set("title")}
          className={inputCls}
          placeholder={copy.titleHint}
        />,
        true,
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {(bookable(kind) ? bookableFields : grid[kind]).map((node, i) => (
          <div key={i}>{node}</div>
        ))}
      </div>

      {field(
        "Description",
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={form.description}
          onChange={set("description")}
          className={inputCls}
          placeholder={copy.description}
        />,
        true,
      )}

      <div>
        <span className="mb-1.5 block text-sm font-semibold text-primary">
          {copy.photos} *{" "}
          <span className="font-normal text-muted-foreground">
            (up to {LIMITS.maxImages}, 10 MB each)
          </span>
        </span>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {keptImages.map((m) => (
            <Thumb
              key={m.id}
              src={mediaUrl(m.storage_path)}
              onRemove={() => setRemoved([...removed, m])}
            />
          ))}
          {images.map((f, i) => (
            <Thumb
              key={`${f.name}-${i}`}
              src={imagePreviews[i]}
              onRemove={() => setImages(images.filter((_, j) => j !== i))}
            />
          ))}
          {keptImages.length + images.length < LIMITS.maxImages && (
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-input text-muted-foreground hover:border-primary-bright hover:text-primary-bright">
              <span className="flex flex-col items-center gap-1 text-xs font-semibold">
                <ImagePlus className="size-6" /> Add
              </span>
              <input
                type="file"
                accept={LIMITS.imageTypes.join(",")}
                multiple
                className="sr-only"
                onChange={(e) => {
                  addFiles("image", e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-semibold text-primary">
          Videos{" "}
          <span className="font-normal text-muted-foreground">
            (optional, up to {LIMITS.maxVideos}, 50 MB each)
          </span>
        </span>
        <ul className="space-y-2">
          {keptVideos.map((m, i) => (
            <VideoRow
              key={m.id}
              name={`Video ${i + 1}`}
              onRemove={() => setRemoved([...removed, m])}
            />
          ))}
          {videos.map((f, i) => (
            <VideoRow
              key={`${f.name}-${i}`}
              name={f.name}
              size={f.size}
              onRemove={() => setVideos(videos.filter((_, j) => j !== i))}
            />
          ))}
        </ul>
        {keptVideos.length + videos.length < LIMITS.maxVideos && (
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold text-primary hover:border-primary-bright">
            <Video className="size-4" /> Add video
            <input
              type="file"
              accept={LIMITS.videoTypes.join(",")}
              className="sr-only"
              onChange={(e) => {
                addFiles("video", e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {listing && !isStaff && (
        <p className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
          After you save, your listing is checked again before it goes back live.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary-bright disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy
            ? progress && progress.total > 0
              ? `Uploading ${progress.done} of ${progress.total}…`
              : "Saving…"
            : listing
              ? "Save changes"
              : bookable(kind)
                ? "Publish"
                : "Submit listing"}
        </button>
        <Link
          to={bookable(kind) ? "/precious" : "/my-listings"}
          className="inline-flex items-center justify-center rounded-full border border-input px-6 py-3.5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
      <img src={src} alt="" className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary/80 text-primary-foreground"
        aria-label="Remove photo"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function VideoRow({ name, size, onRemove }: { name: string; size?: number; onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <Video className="size-4 shrink-0 text-primary-bright" />
        <span className="truncate">{name}</span>
        {size !== undefined && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {(size / 1024 / 1024).toFixed(1)} MB
          </span>
        )}
      </span>
      <button type="button" onClick={onRemove} aria-label="Remove video">
        <X className="size-4" />
      </button>
    </li>
  );
}
