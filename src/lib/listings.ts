import { supabase } from "./supabase";

export const BUCKET = "listing-media";

export const CATEGORIES = [
  "Furniture & home goods",
  "Electronics & phones",
  "Kitchen appliances",
  "Bikes & transport",
  "Study & work gear",
  "Baby & family items",
  "Clothing",
  "Other",
] as const;

export const SERVICE_CATEGORIES = [
  "Hair & braiding",
  "Food & catering",
  "Beauty & makeup",
  "Photography & video",
  "Events & DJ",
  "Cleaning & home",
  "Lessons & tutoring",
  "Tailoring & fashion",
  "Other",
] as const;

export const CONDITIONS = ["New", "Like new", "Good", "Fair"] as const;

export type ListingKind = "item" | "service";

/** What a service's starting price is charged per. */
export const PRICE_UNITS = {
  hour: "per hour",
  session: "per session",
  person: "per person",
  job: "per job",
} as const;
export type PriceUnit = keyof typeof PRICE_UNITS;

// Keep these in sync with supabase/schema.sql (bucket limits + triggers).
export const LIMITS = {
  maxImages: 8,
  maxVideos: 2,
  maxImageBytes: 10 * 1024 * 1024,
  maxVideoBytes: 50 * 1024 * 1024,
  // Listing only these types makes iPhones convert HEIC photos to JPEG on upload.
  imageTypes: ["image/jpeg", "image/png", "image/webp"],
  videoTypes: ["video/mp4", "video/quicktime", "video/webm"],
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export type ListingStatus = "pending" | "published" | "sold" | "rejected";

export interface ListingMedia {
  id: string;
  listing_id: string;
  kind: "image" | "video";
  storage_path: string;
  position: number;
}

export interface Listing {
  id: string;
  user_id: string;
  kind: ListingKind;
  title: string;
  description: string;
  price_eur: number | null;
  price_unit: PriceUnit | null;
  category: string;
  condition: string | null;
  city: string | null;
  seller_name: string | null;
  status: ListingStatus;
  created_at: string;
  listing_media: ListingMedia[];
}

export function mediaUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function sortedMedia(l: Listing) {
  return [...(l.listing_media ?? [])].sort((a, b) => a.position - b.position);
}

export function formatPrice(p: number | null) {
  if (p === null || p === undefined) return "Price on request";
  return new Intl.NumberFormat("en-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(Number(p)) ? 0 : 2,
  }).format(p);
}

/** "€500" for items; "From €40 per session" for services. */
export function priceLabel(l: Pick<Listing, "kind" | "price_eur" | "price_unit">) {
  if (l.kind === "item" || l.price_eur === null) return formatPrice(l.price_eur);
  return `From ${formatPrice(l.price_eur)}${l.price_unit ? ` ${PRICE_UNITS[l.price_unit]}` : ""}`;
}

export async function fetchPublishedListings(kind: ListingKind, limit = 60): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*)")
    .eq("kind", kind)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Listing | null) ?? null;
}

export async function fetchMyListings(userId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function markListingSold(id: string) {
  const { error } = await supabase.from("listings").update({ status: "sold" }).eq("id", id);
  if (error) throw error;
}

export async function deleteListing(listing: Listing) {
  const paths = (listing.listing_media ?? []).map((m) => m.storage_path);
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
  const { error } = await supabase.from("listings").delete().eq("id", listing.id);
  if (error) throw error;
}

export interface NewListingInput {
  kind: ListingKind;
  userId: string;
  sellerName: string;
  title: string;
  description: string;
  priceEur: number | null;
  priceUnit: PriceUnit | null;
  category: string;
  condition: string;
  city: string;
  images: File[];
  videos: File[];
}

export function validateFiles(files: File[], kind: "image" | "video"): string | null {
  const types = kind === "image" ? LIMITS.imageTypes : LIMITS.videoTypes;
  const max = kind === "image" ? LIMITS.maxImageBytes : LIMITS.maxVideoBytes;
  for (const f of files) {
    if (!types.includes(f.type)) {
      return `"${f.name}" is not a supported ${kind} format.`;
    }
    if (f.size > max) {
      return `"${f.name}" is larger than ${Math.round(max / 1024 / 1024)} MB.`;
    }
  }
  return null;
}

/**
 * Creates the listing row (status "pending"), uploads every file to storage,
 * then records the files. If anything fails everything is rolled back.
 */
export async function createListing(
  input: NewListingInput,
  onProgress?: (done: number, total: number) => void,
): Promise<string> {
  const { data: created, error } = await supabase
    .from("listings")
    .insert({
      kind: input.kind,
      user_id: input.userId,
      seller_name: input.sellerName || null,
      title: input.title,
      description: input.description,
      price_eur: input.priceEur,
      price_unit: input.priceUnit,
      category: input.category,
      condition: input.condition || null,
      city: input.city || null,
    })
    .select("id")
    .single();
  if (error || !created) throw error ?? new Error("Could not create the listing.");

  const listingId = created.id as string;
  const uploaded: string[] = [];
  const all = [
    ...input.images.map((file) => ({ file, kind: "image" as const })),
    ...input.videos.map((file) => ({ file, kind: "video" as const })),
  ];

  try {
    const rows: { listing_id: string; user_id: string; kind: string; storage_path: string; position: number }[] = [];
    let done = 0;
    onProgress?.(0, all.length);
    for (const [i, item] of all.entries()) {
      const ext = EXT[item.file.type] ?? "bin";
      const path = `${input.userId}/${listingId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, item.file, { contentType: item.file.type, cacheControl: "31536000" });
      if (upErr) throw upErr;
      uploaded.push(path);
      rows.push({ listing_id: listingId, user_id: input.userId, kind: item.kind, storage_path: path, position: i });
      done += 1;
      onProgress?.(done, all.length);
    }
    if (rows.length) {
      const { error: mediaErr } = await supabase.from("listing_media").insert(rows);
      if (mediaErr) throw mediaErr;
    }
    return listingId;
  } catch (err) {
    if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
    await supabase.from("listings").delete().eq("id", listingId);
    throw err;
  }
}

// ───────────── Staff helpers (RLS only lets staff use these) ─────────────

export interface SellerProfile {
  id: string;
  display_name: string;
  whatsapp: string;
}

export async function fetchProfiles(ids: string[]): Promise<Record<string, SellerProfile>> {
  if (ids.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, whatsapp")
    .in("id", ids);
  if (error) throw error;
  return Object.fromEntries(((data ?? []) as SellerProfile[]).map((p) => [p.id, p]));
}

export async function setListingStatus(id: string, status: ListingStatus) {
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) throw error;
}

export type StaffRole = "admin" | "manager";

/** The signed-in user's staff role, or null for regular users. */
export async function fetchStaffRole(): Promise<StaffRole | null> {
  const { data, error } = await supabase.rpc("staff_role");
  if (error) throw error;
  return data as StaffRole | null;
}

export async function setStaffRole(userId: string, role: StaffRole | null) {
  const { error } = await supabase.rpc("set_staff_role", { target: userId, new_role: role });
  if (error) throw error;
}

export async function fetchAllListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  whatsapp: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  listing_count: number;
  role: StaffRole | null;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}
