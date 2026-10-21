import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SetupNotice } from "@/components/SetupNotice";
import { useAuth } from "@/lib/auth";
import {
  deleteListing,
  fetchMyListings,
  priceLabel,
  markListingSold,
  mediaUrl,
  sortedMedia,
  type Listing,
  type ListingStatus,
} from "@/lib/listings";

export const Route = createFileRoute("/my-listings")({
  head: () => ({
    meta: [{ title: "My listings | Mallick Assist Service" }, { name: "robots", content: "noindex" }],
  }),
  component: MyListingsPage,
});

const STATUS_LABEL: Record<ListingStatus, { text: string; cls: string }> = {
  pending: { text: "Waiting for review", cls: "bg-accent/30 text-primary" },
  published: { text: "Live", cls: "bg-whatsapp/20 text-primary" },
  sold: { text: "Sold", cls: "bg-secondary text-muted-foreground" },
  rejected: { text: "Not approved", cls: "bg-destructive/15 text-destructive" },
};

function MyListingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/my-listings" } });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: () => fetchMyListings(user!.id),
    enabled: Boolean(user),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
  };

  const sold = useMutation({
    mutationFn: (l: Listing) => markListingSold(l.id),
    onSuccess: () => {
      toast.success("Marked as sold.");
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

  if (loading || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <SetupNotice />
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold text-primary">My listings</h1>
        <Link
          to="/sell"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
        >
          <Plus className="size-4" /> Add a listing
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <div className="rounded-3xl bg-secondary/70 p-10 text-center">
            <p className="font-display text-xl font-extrabold text-primary">You have no listings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Add photos, a video and a description of what you want to sell.</p>
          </div>
        ) : (
          data.map((l) => {
            const cover = sortedMedia(l).find((m) => m.kind === "image");
            const status = STATUS_LABEL[l.status];
            return (
              <article key={l.id} className="flex gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:size-28">
                  {cover && <img src={mediaUrl(cover.storage_path)} alt="" className="size-full object-cover" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>{status.text}</span>
                    <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                  <h2 className="mt-1.5 truncate text-sm font-semibold">{l.title}</h2>
                  <p className="text-sm text-primary">{priceLabel(l)}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-3 text-xs font-semibold">
                    {(l.status === "published" || l.status === "sold") && (
                      <Link to={l.kind === "service" ? "/services/$id" : "/marketplace/$id"} params={{ id: l.id }} className="rounded-full border border-input px-3 py-1.5 hover:border-primary-bright">
                        View
                      </Link>
                    )}
                    {l.status === "published" && (
                      <button
                        type="button"
                        disabled={sold.isPending}
                        onClick={() => sold.mutate(l)}
                        className="rounded-full border border-input px-3 py-1.5 hover:border-primary-bright disabled:opacity-60"
                      >
                        {l.kind === "service" ? "Mark unavailable" : "Mark as sold"}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm("Delete this listing and its photos and videos?")) remove.mutate(l);
                      }}
                      className="rounded-full border border-destructive/40 px-3 py-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
