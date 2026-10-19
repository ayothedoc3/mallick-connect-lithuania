import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAdminUsers, setStaffRole, type AdminUser, type StaffRole } from "@/lib/listings";

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "Never");

const ROLE_LABEL: Record<StaffRole | "none", string> = {
  none: "User",
  manager: "Manager",
  admin: "Admin",
};

export function UsersTab({ myId }: { myId: string }) {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });

  const changeRole = useMutation({
    mutationFn: ({ user, role }: { user: AdminUser; role: StaffRole | null }) =>
      setStaffRole(user.id, role),
    onSuccess: (_d, { user, role }) => {
      toast.success(
        `${user.email} is now ${role ? `a ${ROLE_LABEL[role].toLowerCase()}` : "a regular user"}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not change the role."),
  });

  if (users.isLoading) return <p className="text-sm text-muted-foreground">Loading users…</p>;
  if (users.error)
    return <p className="text-sm text-destructive">{(users.error as Error).message}</p>;

  const all = users.data ?? [];
  const staff = all.filter((u) => u.role);

  function onRoleChange(user: AdminUser, value: string) {
    const role = value === "none" ? null : (value as StaffRole);
    const text = role
      ? `Make ${user.email} ${role === "admin" ? "an admin (full control, including settings and staff)" : "a manager (listings and requests only)"}?`
      : `Remove staff access from ${user.email}?`;
    if (window.confirm(text)) changeRole.mutate({ user, role });
  }

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-border bg-card p-5 text-sm shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-primary">Staff roles</h2>
        <ul className="mt-2 grid gap-1 text-muted-foreground">
          <li>
            <strong className="text-primary">Manager:</strong> approves, rejects and deletes
            listings, and handles service requests.
          </li>
          <li>
            <strong className="text-primary">Admin:</strong> everything a manager can do, plus
            users, staff roles, site settings and analytics.
          </li>
        </ul>
        <p className="mt-3 text-muted-foreground">
          To add a manager, ask them to create an account on the site first, then change their role
          below. Current staff: {staff.map((u) => `${u.email} (${ROLE_LABEL[u.role!]})`).join(", ")}
          .
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{all.length} accounts on the site.</p>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/70 text-xs uppercase tracking-wide text-primary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Listings</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last sign-in</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {all.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">{u.display_name || "No name"}</td>
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
                  <td className="px-4 py-3">
                    {u.id === myId ? (
                      <span className="rounded-full bg-accent/40 px-2.5 py-1 text-xs font-semibold text-primary">
                        {ROLE_LABEL[u.role ?? "none"]} (you)
                      </span>
                    ) : (
                      <select
                        value={u.role ?? "none"}
                        disabled={changeRole.isPending}
                        onChange={(e) => onRoleChange(u, e.target.value)}
                        aria-label={`Role for ${u.email}`}
                        className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm font-semibold"
                      >
                        <option value="none">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
