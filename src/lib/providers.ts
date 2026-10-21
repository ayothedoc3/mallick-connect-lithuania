import { supabase } from "./supabase";
import type { Listing } from "./listings";

export interface ProviderProfile {
  user_id: string;
  display_name: string;
  bio: string;
  verified: boolean;
  created_at: string;
}

export interface Rating {
  provider_id: string;
  average: number;
  count: number;
}

export type ReviewStatus = "pending" | "published" | "rejected";

export interface Review {
  id: string;
  provider_id: string;
  author_id: string;
  author_name: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  created_at: string;
}

export interface ProviderPage {
  profile: ProviderProfile;
  rating: Rating | null;
  reviews: Review[];
  services: Listing[];
}

export async function fetchProviderPage(userId: string): Promise<ProviderPage | null> {
  const { data: profile, error } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;
  const [rating, reviews, services] = await Promise.all([
    supabase.from("provider_ratings").select("*").eq("provider_id", userId).maybeSingle(),
    supabase
      .from("reviews")
      .select("*")
      .eq("provider_id", userId)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("*, listing_media(*)")
      .eq("user_id", userId)
      .eq("kind", "service")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);
  for (const r of [rating, reviews, services]) if (r.error) throw r.error;
  return {
    profile: profile as ProviderProfile,
    rating: (rating.data as Rating | null) ?? null,
    reviews: (reviews.data ?? []) as Review[],
    services: (services.data ?? []) as Listing[],
  };
}

/** Verified flag and rating for each provider, keyed by user id. */
export async function fetchProviderBadges(ids: string[]) {
  if (ids.length === 0) return {} as Record<string, { verified: boolean; rating: Rating | null }>;
  const [profiles, ratings] = await Promise.all([
    supabase.from("provider_profiles").select("user_id, verified").in("user_id", ids),
    supabase.from("provider_ratings").select("*").in("provider_id", ids),
  ]);
  if (profiles.error) throw profiles.error;
  if (ratings.error) throw ratings.error;
  return Object.fromEntries(
    ids.map((id) => [
      id,
      {
        verified: Boolean(profiles.data?.find((p) => p.user_id === id)?.verified),
        rating: ((ratings.data ?? []) as Rating[]).find((r) => r.provider_id === id) ?? null,
      },
    ]),
  );
}

export async function fetchOwnProfile(userId: string): Promise<ProviderProfile | null> {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as ProviderProfile | null;
}

export async function updateOwnProfile(userId: string, displayName: string, bio: string) {
  const { error } = await supabase
    .from("provider_profiles")
    .update({ display_name: displayName, bio })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setProviderVerified(userId: string, verified: boolean) {
  const { error } = await supabase
    .from("provider_profiles")
    .update({ verified })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function fetchMyReview(providerId: string, authorId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", providerId)
    .eq("author_id", authorId)
    .maybeSingle();
  if (error) throw error;
  return data as Review | null;
}

export async function submitReview(input: {
  providerId: string;
  authorId: string;
  authorName: string;
  rating: number;
  body: string;
}) {
  const { error } = await supabase.from("reviews").insert({
    provider_id: input.providerId,
    author_id: input.authorId,
    author_name: input.authorName,
    rating: input.rating,
    body: input.body,
  });
  if (error) {
    if (error.code === "23505") throw new Error("You've already reviewed this provider.");
    throw error;
  }
}

// ───────────── Staff ─────────────

export type ReviewWithProvider = Review & { provider_profiles: { display_name: string } };

export async function fetchAllReviews(): Promise<ReviewWithProvider[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, provider_profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ReviewWithProvider[];
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
