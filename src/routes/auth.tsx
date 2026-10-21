import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { SetupNotice } from "@/components/SetupNotice";
import type { ListingKind } from "@/lib/listings";

type Redirect = "/sell" | "/my-listings";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: Redirect; type?: ListingKind } => ({
    redirect: s.redirect === "/sell" || s.redirect === "/my-listings" ? s.redirect : undefined,
    type: s.type === "service" ? "service" : s.type === "item" ? "item" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account | Mallick Assist Service" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

function AuthPage() {
  const { redirect, type } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", password: "" });

  const target: Redirect = redirect ?? "/my-listings";

  useEffect(() => {
    if (!loading && user) navigate({ to: target, search: target === "/sell" ? { type } : {} });
  }, [loading, user, navigate, target, type]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        navigate({ to: target, search: target === "/sell" ? { type } : {} });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { display_name: form.name.trim(), whatsapp: form.whatsapp.trim() },
            emailRedirectTo: `${window.location.origin}${target}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: target, search: target === "/sell" ? { type } : {} });
        } else {
          setCheckEmail(true);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <SetupNotice />
      <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border">
        <h1 className="font-display text-2xl font-extrabold text-primary">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to list items and manage your listings."
            : "Create an account to sell items on our marketplace."}
        </p>

        {checkEmail ? (
          <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm">
            <p className="font-semibold text-primary">Check your email</p>
            <p className="mt-1 text-muted-foreground">
              We sent a confirmation link to <strong>{form.email}</strong>. Open it, then come back
              and sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {mode === "signup" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary">Full name</span>
                  <input required minLength={2} maxLength={80} value={form.name} onChange={set("name")} className={inputCls} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary">WhatsApp number</span>
                  <input required maxLength={30} value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} placeholder="+370…" autoComplete="tel" inputMode="tel" />
                </label>
              </>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary">Email</span>
              <input required type="email" value={form.email} onChange={set("email")} className={inputCls} autoComplete="email" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary">Password</span>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={set("password")}
                className={inputCls}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              {mode === "signup" && <span className="mt-1 block text-xs text-muted-foreground">At least 8 characters.</span>}
              {mode === "signin" && (
                <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-semibold text-primary-bright hover:underline">
                  Forgot your password?
                </Link>
              )}
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright transition shadow-soft disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setCheckEmail(false);
            }}
            className="font-semibold text-primary-bright hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </section>
  );
}
