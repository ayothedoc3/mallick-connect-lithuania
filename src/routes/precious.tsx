import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/listings";
import { ListingsTab } from "@/components/admin/ListingsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { RequestsTab } from "@/components/admin/RequestsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "listings", label: "Listings" },
  { id: "requests", label: "Requests" },
  { id: "users", label: "Users" },
  { id: "settings", label: "Site settings" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/precious")({
  validateSearch: (s: Record<string, unknown>): { tab: Tab } => ({
    tab: TABS.some((t) => t.id === s.tab) ? (s.tab as Tab) : "listings",
  }),
  head: () => ({
    meta: [
      { title: "Admin | Mallick Assist Service" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, signOut } = useAuth();
  const { tab } = Route.useSearch();

  const admin = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: isAdminUser,
    enabled: Boolean(user),
  });

  if (loading || (user && admin.isLoading)) {
    return <Centered>Loading…</Centered>;
  }
  if (!user) return <AdminLogin />;
  if (admin.error) {
    return <Centered>Could not check admin access: {(admin.error as Error).message}</Centered>;
  }
  if (!admin.data) {
    return (
      <Centered>
        <p className="font-semibold text-primary">This account does not have admin access.</p>
        <p className="mt-1">Signed in as {user.email}.</p>
        <button
          onClick={signOut}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Sign out
        </button>
      </Centered>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-primary">Admin</h1>
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <button
          onClick={signOut}
          className="rounded-full border border-input px-4 py-2 text-sm font-semibold hover:border-primary-bright"
        >
          Sign out
        </button>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-secondary p-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            to="/precious"
            search={{ tab: t.id }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === t.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-primary hover:bg-background/60",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "listings" && <ListingsTab />}
        {tab === "requests" && <RequestsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </section>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-primary">Admin sign in</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Mallick Assist Service control panel.
        </p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary-bright disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}
