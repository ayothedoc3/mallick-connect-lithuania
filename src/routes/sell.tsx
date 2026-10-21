import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { SetupNotice } from "@/components/SetupNotice";
import { FORM_COPY, ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/lib/auth";
import { fetchListing, fetchStaffRole, type ListingKind } from "@/lib/listings";
import { cn } from "@/lib/utils";

const KINDS = ["item", "service", "stay", "hall"] as const;

export const Route = createFileRoute("/sell")({
  validateSearch: (s: Record<string, unknown>): { type?: ListingKind; edit?: string } => ({
    type: KINDS.find((k) => k === s.type),
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sell an item or offer a service | Mallick Assist Service" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SellPage,
});

const centered = "mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground";

function SellPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const role = useQuery({ queryKey: ["staff-role", user?.id], queryFn: fetchStaffRole, enabled: Boolean(user) });
  const editing = useQuery({
    queryKey: ["listing", search.edit],
    queryFn: () => fetchListing(search.edit!),
    enabled: Boolean(user && search.edit),
  });

  const kind: ListingKind = editing.data?.kind ?? search.type ?? "item";
  const isStaff = Boolean(role.data);

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/auth",
        search: { redirect: "/sell", type: kind === "service" ? "service" : "item" },
      });
    }
  }, [loading, user, navigate, kind]);

  if (loading || !user || role.isLoading || editing.isLoading) return <div className={centered}>Loading…</div>;
  if (search.edit && !editing.data) return <div className={centered}>This listing can't be found.</div>;
  if ((kind === "stay" || kind === "hall") && !isStaff) {
    return <div className={centered}>Only Mallick staff can add stays and halls.</div>;
  }

  const copy = FORM_COPY[kind];
  const switcher =
    !editing.data && (kind === "item" || kind === "service") ? (
      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-primary">What are you listing?</legend>
        <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary p-1">
          {(["item", "service"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => navigate({ to: "/sell", search: { type: k }, replace: true })}
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
    ) : null;

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={editing.data ? `Edit: ${editing.data.title}` : copy.heading}
        subtitle={editing.data ? undefined : copy.subtitle}
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <SetupNotice />
        {/* key resets the form when switching between item and service */}
        <ListingForm
          key={`${kind}-${editing.data?.id ?? "new"}`}
          kind={kind}
          user={user}
          isStaff={isStaff}
          listing={editing.data ?? undefined}
          header={switcher}
        />
      </section>
    </>
  );
}
