import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Stars } from "@/components/Stars";
import { deleteReview, fetchAllReviews, setReviewStatus, type ReviewStatus } from "@/lib/providers";
import { cn } from "@/lib/utils";

const FILTERS: { id: ReviewStatus; label: string }[] = [
  { id: "pending", label: "Waiting for review" },
  { id: "published", label: "Published" },
  { id: "rejected", label: "Rejected" },
];

const btn =
  "rounded-full border border-input px-3 py-1.5 font-semibold hover:border-primary-bright disabled:opacity-60";

export function ReviewsTab() {
  const [filter, setFilter] = useState<ReviewStatus>("pending");
  const queryClient = useQueryClient();
  const reviews = useQuery({ queryKey: ["admin", "reviews"], queryFn: fetchAllReviews });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });

  const status = useMutation({
    mutationFn: ({ id, to }: { id: string; to: ReviewStatus }) => setReviewStatus(id, to),
    onSuccess: () => {
      toast.success("Review updated.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });
  const remove = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review deleted.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete."),
  });

  if (reviews.isLoading) return <p className="text-sm text-muted-foreground">Loading reviews…</p>;
  if (reviews.error)
    return <p className="text-sm text-destructive">{(reviews.error as Error).message}</p>;

  const all = reviews.data ?? [];
  const shown = all.filter((r) => r.status === filter);
  const busy = status.isPending || remove.isPending;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Reviews customers leave on provider profiles. They only appear once published.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
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
            {f.label}{" "}
            <span className="opacity-70">({all.filter((r) => r.status === f.id).length})</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {shown.length === 0 && (
          <p className="rounded-3xl bg-secondary/70 p-10 text-center text-sm text-muted-foreground">
            Nothing here.
          </p>
        )}
        {shown.map((r) => (
          <article key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">
                <span className="font-semibold text-primary">{r.author_name}</span> reviewed{" "}
                <Link
                  to="/pros/$id"
                  params={{ id: r.provider_id }}
                  className="font-semibold text-primary-bright hover:underline"
                >
                  {r.provider_profiles.display_name}
                </Link>
              </p>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            <Stars value={r.rating} className="mt-2" />
            <p className="mt-2 whitespace-pre-line text-sm">{r.body}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {r.status !== "published" && (
                <button
                  disabled={busy}
                  onClick={() => status.mutate({ id: r.id, to: "published" })}
                  className="rounded-full bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:bg-primary-bright disabled:opacity-60"
                >
                  Publish
                </button>
              )}
              {r.status !== "rejected" && (
                <button
                  disabled={busy}
                  onClick={() => status.mutate({ id: r.id, to: "rejected" })}
                  className={btn}
                >
                  Reject
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Delete this review?")) remove.mutate(r.id);
                }}
                className="rounded-full border border-destructive/40 px-3 py-1.5 font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
