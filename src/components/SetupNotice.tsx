import { isSupabaseConfigured } from "@/lib/supabase";

export function SetupNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold text-destructive">Marketplace is not connected yet.</p>
      <p className="mt-1 text-muted-foreground">
        Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to the
        site&apos;s environment variables and rebuild. See SETUP.md.
      </p>
    </div>
  );
}
