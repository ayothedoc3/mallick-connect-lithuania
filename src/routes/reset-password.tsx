import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password | Mallick Assist Service" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

// The emailed link signs the person in, then lands here to set a new password.
function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password changed.");
    navigate({ to: "/my-listings" });
  }

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-primary">Choose a new password</h1>
        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Checking your link…</p>
        ) : !user ? (
          <div className="mt-6 text-sm">
            <p className="text-muted-foreground">
              This reset link has expired or was already used.
            </p>
            <Link
              to="/forgot-password"
              className="mt-4 inline-block font-semibold text-primary-bright hover:underline"
            >
              Send a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <p className="text-sm text-muted-foreground">For {user.email}</p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary">New password</span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                At least 8 characters.
              </span>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary-bright disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
