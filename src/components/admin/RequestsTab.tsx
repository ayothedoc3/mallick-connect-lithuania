import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  deleteServiceRequest,
  fetchServiceRequests,
  setRequestStatus,
  type RequestStatus,
} from "@/lib/requests";
import { cn } from "@/lib/utils";

const STATUSES: { id: RequestStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "done", label: "Done" },
];

export function RequestsTab() {
  const [filter, setFilter] = useState<RequestStatus>("new");
  const queryClient = useQueryClient();
  const requests = useQuery({ queryKey: ["admin", "requests"], queryFn: fetchServiceRequests });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });

  const status = useMutation({
    mutationFn: ({ id, to }: { id: string; to: RequestStatus }) => setRequestStatus(id, to),
    onSuccess: refresh,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the request."),
  });
  const remove = useMutation({
    mutationFn: deleteServiceRequest,
    onSuccess: () => {
      toast.success("Request deleted.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete the request."),
  });

  if (requests.isLoading) return <p className="text-sm text-muted-foreground">Loading requests…</p>;
  if (requests.error)
    return <p className="text-sm text-destructive">{(requests.error as Error).message}</p>;

  const all = requests.data ?? [];
  const shown = all.filter((r) => r.status === filter);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Everything sent through the "Request a Service" forms on the site.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
              filter === s.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary-bright",
            )}
          >
            {s.label}{" "}
            <span className="opacity-70">({all.filter((r) => r.status === s.id).length})</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {shown.length === 0 && (
          <p className="rounded-3xl bg-secondary/70 p-10 text-center text-sm text-muted-foreground">
            No requests here.
          </p>
        )}
        {shown.map((r) => (
          <article key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-extrabold text-primary">{r.service}</h2>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <Row label="Name" value={r.name} />
              <Row label="WhatsApp" value={r.whatsapp} />
              <Row label="Email" value={r.email} />
              <Row label="City" value={r.city} />
              <Row label="Budget" value={r.budget && `€${r.budget}`} />
              <Row label="Preferred date" value={r.preferred_date} />
            </dl>
            {r.message && (
              <p className="mt-3 whitespace-pre-line rounded-2xl bg-secondary/70 p-3 text-sm">
                {r.message}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <a
                href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${r.name}, this is Mallick Assist Service about your ${r.service} request.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-4 py-1.5 font-bold text-whatsapp-foreground hover:brightness-110"
              >
                <MessageCircle className="size-3.5" /> Reply on WhatsApp
              </a>
              {STATUSES.filter((s) => s.id !== r.status).map((s) => (
                <button
                  key={s.id}
                  disabled={status.isPending}
                  onClick={() => status.mutate({ id: r.id, to: s.id })}
                  className="rounded-full border border-input px-3 py-1.5 font-semibold hover:border-primary-bright disabled:opacity-60"
                >
                  Mark {s.label.toLowerCase()}
                </button>
              ))}
              <button
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm(`Delete the request from ${r.name}?`)) remove.mutate(r.id);
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

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="font-semibold text-primary">{label}:</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  );
}
