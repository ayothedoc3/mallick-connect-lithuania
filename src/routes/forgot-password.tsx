import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password | Mallick Assist Service" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else setSent(true);
  }

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-primary">Reset your password</h1>
        {sent ? (
          <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm">
            <p className="font-semibold text-primary">Check your email</p>
            <p className="mt-1 text-muted-foreground">
              If <strong>{email}</strong> has an account, we've sent a link to choose a new
              password. It expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <p className="text-sm text-muted-foreground">
              Enter the email you signed up with and we'll send you a reset link.
            </p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary-bright disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/auth" className="font-semibold text-primary-bright hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
