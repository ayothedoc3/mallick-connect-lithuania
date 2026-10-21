import { useState, type FormEvent } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ListingCard } from "@/components/ListingCard";
import { StarPicker, Stars } from "@/components/Stars";
import { useAuth } from "@/lib/auth";
import { fetchMyReview, fetchProviderPage, submitReview } from "@/lib/providers";
import { useWaLink } from "@/lib/settings";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/pros/$id")({
  loader: async ({ params }) => {
    if (!UUID.test(params.id)) throw notFound();
    const page = await fetchProviderPage(params.id);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData: page }) => {
    if (!page) return { meta: [{ title: "Provider not found | Mallick Assist Service" }] };
    const title = `${page.profile.display_name}: local pro in Vilnius | Mallick Assist Service`;
    const description = (page.profile.bio || page.services.map((s) => s.title).join(", ")).slice(
      0,
      155,
    );
    const url = `https://mallickassistservice.com/pros/${page.profile.user_id}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: page.rating
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: page.profile.display_name,
                description,
                url,
                areaServed: "Vilnius",
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: page.rating.average,
                  reviewCount: page.rating.count,
                },
              }),
            },
          ]
        : [],
    };
  },
  component: ProviderPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold text-primary">Provider not found</h1>
      <Link
        to="/services"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
      >
        Back to local pros
      </Link>
    </div>
  ),
});

function ProviderPage() {
  const { profile, rating, reviews, services } = Route.useLoaderData();
  const waLink = useWaLink();
  const message = `Hello Mallick Assist Service, I'd like to book ${profile.display_name}. https://mallickassistservice.com/pros/${profile.user_id}`;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-bright hover:underline"
      >
        <ArrowLeft className="size-4" /> All local pros
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="grid size-16 place-items-center rounded-2xl bg-primary font-display text-2xl font-extrabold text-accent">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-primary">
            {profile.display_name}
          </h1>
          {profile.verified && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary-bright">
              <BadgeCheck className="size-4" /> Verified by Mallick
            </p>
          )}
          {rating ? (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Stars value={Number(rating.average)} />
              <span className="font-semibold">{Number(rating.average).toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({rating.count} review{rating.count === 1 ? "" : "s"})
              </span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No reviews yet</p>
          )}
          {profile.bio && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{profile.bio}</p>
          )}
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold text-whatsapp-foreground shadow-soft hover:brightness-110"
          >
            <MessageCircle className="size-4" strokeWidth={2.5} /> Book on WhatsApp
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            Messages go to Mallick Assist Service, who connect you with{" "}
            {profile.display_name.split(" ")[0]}.
          </p>
        </aside>

        <div>
          <h2 className="font-display text-xl font-extrabold text-primary">Services</h2>
          {services.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No services listed right now.</p>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {services.map((l) => (
                <ListingCard key={l.id} listing={l} verified={profile.verified} />
              ))}
            </div>
          )}

          <h2 className="mt-12 font-display text-xl font-extrabold text-primary">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Be the first to review {profile.display_name}.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm">{r.body}</p>
                  <p className="mt-3 text-sm font-semibold text-primary">{r.author_name}</p>
                </li>
              ))}
            </ul>
          )}
          <ReviewForm providerId={profile.user_id} providerName={profile.display_name} />
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

function ReviewForm({ providerId, providerName }: { providerId: string; providerName: string }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  const mine = useQuery({
    queryKey: ["my-review", providerId, user?.id],
    queryFn: () => fetchMyReview(providerId, user!.id),
    enabled: Boolean(user) && user?.id !== providerId,
  });

  const send = useMutation({
    mutationFn: () =>
      submitReview({
        providerId,
        authorId: user!.id,
        authorName: (user!.user_metadata?.display_name as string | undefined)?.trim() || "Customer",
        rating,
        body: body.trim(),
      }),
    onSuccess: () => {
      toast.success("Thanks! Your review will appear after a quick check.");
      queryClient.invalidateQueries({ queryKey: ["my-review", providerId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send your review."),
  });

  if (loading) return null;
  if (!user) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Used {providerName}'s services?{" "}
        <Link to="/auth" className="font-semibold text-primary-bright hover:underline">
          Sign in to leave a review
        </Link>
      </p>
    );
  }
  if (user.id === providerId || mine.isLoading) return null;
  if (mine.data) {
    return (
      <p className="mt-6 rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
        {mine.data.status === "published"
          ? "Thanks for your review."
          : mine.data.status === "pending"
            ? "Thanks! Your review is waiting for a quick check."
            : "Your review wasn't published."}
      </p>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rating) {
      toast.error("Choose a star rating.");
      return;
    }
    send.mutate();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid gap-4 rounded-3xl border border-border bg-card p-5"
    >
      <h3 className="font-display text-lg font-extrabold text-primary">Review {providerName}</h3>
      <StarPicker value={rating} onChange={setRating} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">Your review</span>
        <textarea
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={inputCls}
          placeholder="What did they do for you, and how was it?"
        />
      </label>
      <button
        type="submit"
        disabled={send.isPending}
        className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-bright disabled:opacity-60"
      >
        {send.isPending ? "Sending…" : "Send review"}
      </button>
    </form>
  );
}
