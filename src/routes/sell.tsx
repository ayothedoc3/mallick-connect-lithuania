import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/PageHero";
import { SetupNotice } from "@/components/SetupNotice";
import { useAuth } from "@/lib/auth";
import {
  CATEGORIES,
  CONDITIONS,
  LIMITS,
  PRICE_UNITS,
  SERVICE_CATEGORIES,
  createListing,
  validateFiles,
  type ListingKind,
  type PriceUnit,
} from "@/lib/listings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sell")({
  validateSearch: (s: Record<string, unknown>): { type?: ListingKind } => ({
    type: s.type === "service" ? "service" : s.type === "item" ? "item" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sell an item or offer a service | Mallick Assist Service" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SellPage,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

const COPY = {
  item: {
    eyebrow: "Marketplace",
    heading: "Sell an item",
    subtitle: "Add photos, an optional video and a description. We review every listing before it goes live.",
    title: "Title *",
    titleHint: "e.g. IKEA desk, white, 120 cm",
    categories: CATEGORIES,
    price: "Price (EUR)",
    city: "City",
    cityHint: "Vilnius, Kaunas…",
    description: "Size, age, any damage, why you're selling, pickup details…",
    photos: "Photos *",
  },
  service: {
    eyebrow: "Services",
    heading: "Offer your service",
    subtitle:
      "Braiding, cooking, photography or anything else you do. Show your work with photos and a short video. We review every listing before it goes live.",
    title: "Service name *",
    titleHint: "e.g. Knotless braids, any length",
    categories: SERVICE_CATEGORIES,
    price: "Starting price (EUR)",
    city: "Where you work",
    cityHint: "e.g. Vilnius, or I come to you",
    description: "What's included, how long it takes, where you work, when you're available…",
    photos: "Photos of your work *",
  },
} as const;

function SellPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const kind = Route.useSearch().type ?? "item";
  const copy = COPY[kind];

  const [form, setForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    priceUnit: "" as PriceUnit | "",
    city: "",
    description: "",
  });

  function chooseKind(next: ListingKind) {
    setForm((f) => ({ ...f, category: "", condition: "", priceUnit: "" }));
    navigate({ to: "/sell", search: { type: next }, replace: true });
  }
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/sell", type: kind } });
  }, [loading, user, navigate, kind]);

  const imagePreviews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => () => imagePreviews.forEach((u) => URL.revokeObjectURL(u)), [imagePreviews]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function addFiles(kind: "image" | "video", list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const current = kind === "image" ? images : videos;
    const max = kind === "image" ? LIMITS.maxImages : LIMITS.maxVideos;
    if (current.length + incoming.length > max) {
      toast.error(`You can add up to ${max} ${kind === "image" ? "photos" : "videos"}.`);
      return;
    }
    const problem = validateFiles(incoming, kind);
    if (problem) {
      toast.error(problem);
      return;
    }
    if (kind === "image") setImages([...images, ...incoming]);
    else setVideos([...videos, ...incoming]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.category) {
      toast.error("Please choose a category.");
      return;
    }
    if (images.length === 0) {
      toast.error("Add at least one photo.");
      return;
    }
    const price = form.price.trim() === "" ? null : Number(form.price);
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      toast.error("Enter a valid price in EUR.");
      return;
    }
    setBusy(true);
    try {
      await createListing(
        {
          kind,
          userId: user.id,
          sellerName: (user.user_metadata?.display_name as string | undefined) ?? "",
          title: form.title.trim(),
          description: form.description.trim(),
          priceEur: price,
          priceUnit: kind === "service" && form.priceUnit ? form.priceUnit : null,
          category: form.category,
          condition: kind === "item" ? form.condition : "",
          city: form.city.trim(),
          images,
          videos,
        },
        (done, total) => setProgress({ done, total }),
      );
      await queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Submitted! We'll review your listing and publish it shortly.");
      navigate({ to: "/my-listings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  if (loading || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} title={copy.heading} subtitle={copy.subtitle} />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <SetupNotice />
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border grid gap-5">
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold text-primary">What are you listing?</legend>
            <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary p-1">
              {(["item", "service"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => chooseKind(k)}
                  aria-pressed={kind === k}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-sm font-semibold transition",
                    kind === k ? "bg-primary text-primary-foreground shadow-soft" : "text-primary hover:bg-background/60",
                  )}
                >
                  {k === "item" ? "An item to sell" : "A service I offer"}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">{copy.title}</span>
            <input required minLength={3} maxLength={120} value={form.title} onChange={set("title")} className={inputCls} placeholder={copy.titleHint} />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary">Category *</span>
              <select required value={form.category} onChange={set("category")} className={inputCls}>
                <option value="">Select…</option>
                {copy.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            {kind === "item" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary">Condition</span>
                <select value={form.condition} onChange={set("condition")} className={inputCls}>
                  <option value="">Select…</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
            {kind === "service" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary">{copy.city}</span>
                <input maxLength={60} value={form.city} onChange={set("city")} className={inputCls} placeholder={copy.cityHint} />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary">{copy.price}</span>
              <input inputMode="decimal" value={form.price} onChange={set("price")} className={inputCls} placeholder="Leave empty for price on request" />
            </label>
            {kind === "service" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary">Price is charged</span>
                <select value={form.priceUnit} onChange={set("priceUnit")} className={inputCls}>
                  <option value="">Select…</option>
                  {Object.entries(PRICE_UNITS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </label>
            )}
            {kind === "item" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary">{copy.city}</span>
                <input maxLength={60} value={form.city} onChange={set("city")} className={inputCls} placeholder={copy.cityHint} />
              </label>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">Description *</span>
            <textarea required minLength={10} maxLength={5000} rows={6} value={form.description} onChange={set("description")} className={inputCls} placeholder={copy.description} />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-primary">
              {copy.photos} <span className="font-normal normal-case text-muted-foreground">(up to {LIMITS.maxImages}, 10 MB each)</span>
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((f, i) => (
                <div key={`${f.name}-${i}`} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                  <img src={imagePreviews[i]} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary/80 text-primary-foreground"
                    aria-label="Remove photo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {images.length < LIMITS.maxImages && (
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
              Videos <span className="font-normal normal-case text-muted-foreground">(optional, up to {LIMITS.maxVideos}, 50 MB each)</span>
            </span>
            <ul className="space-y-2">
              {videos.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <Video className="size-4 shrink-0 text-primary-bright" />
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </span>
                  <button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))} aria-label="Remove video">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            {videos.length < LIMITS.maxVideos && (
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright transition shadow-soft disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy
                ? progress && progress.total > 0
                  ? `Uploading ${progress.done} of ${progress.total}…`
                  : "Submitting…"
                : "Submit listing"}
            </button>
            <Link to="/my-listings" className="inline-flex items-center justify-center rounded-full border border-input px-6 py-3.5 text-sm font-semibold">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
