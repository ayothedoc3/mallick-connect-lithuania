import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers } from "@/lib/listings";

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "Never");

export function UsersTab() {
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });

  if (users.isLoading) return <p className="text-sm text-muted-foreground">Loading users…</p>;
  if (users.error)
    return <p className="text-sm text-destructive">{(users.error as Error).message}</p>;

  const all = users.data ?? [];
  return (
    <div>
      <p className="text-sm text-muted-foreground">{all.length} accounts on the marketplace.</p>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/70 text-xs uppercase tracking-wide text-primary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {all.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">
                  {u.display_name || "No name"}
                  {u.is_admin && (
                    <span className="ml-2 rounded-full bg-accent/40 px-2 py-0.5 text-xs text-primary">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  {u.whatsapp ? (
                    <a
                      href={`https://wa.me/${u.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-bright hover:underline"
                    >
                      {u.whatsapp}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">{u.listing_count}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(u.created_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(u.last_sign_in_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
