import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { SetupNotice } from "@/components/SetupNotice";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";

type Redirect = "/sell" | "/my-listings";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: Redirect } => ({
    redirect: s.redirect === "/sell" || s.redirect === "/my-listings" ? s.redirect : undefined,
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
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", password: "" });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<TurnstileHandle>(null);

  const target: Redirect = redirect ?? "/my-listings";

  useEffect(() => {
    if (!loading && user) navigate({ to: target });
  }, [loading, user, navigate, target]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Please complete the security check.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
          options: { captchaToken },
        });
        if (error) throw error;
        navigate({ to: target });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { display_name: form.name.trim(), whatsapp: form.whatsapp.trim() },
            emailRedirectTo: `${window.location.origin}${target}`,
            captchaToken,
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: target });
        } else {
          setCheckEmail(true);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      captcha.current?.reset();
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">Full name</span>
                  <input required minLength={2} maxLength={80} value={form.name} onChange={set("name")} className={inputCls} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">WhatsApp number</span>
                  <input required maxLength={30} value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} placeholder="+370…" autoComplete="tel" inputMode="tel" />
                </label>
              </>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">Email</span>
              <input required type="email" value={form.email} onChange={set("email")} className={inputCls} autoComplete="email" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary">Password</span>
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
            </label>
            <Turnstile ref={captcha} onToken={setCaptchaToken} />
            <button
              type="submit"
              disabled={busy || !captchaToken}
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
