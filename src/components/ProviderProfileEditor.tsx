import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { fetchOwnProfile, updateOwnProfile, type ProviderProfile } from "@/lib/providers";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20";

/** Shown on My listings to people who offer a service. */
export function ProviderProfileEditor({ userId }: { userId: string }) {
  const q = useQuery({
    queryKey: ["own-provider", userId],
    queryFn: () => fetchOwnProfile(userId),
  });
  if (!q.data) return null;
  return <Editor profile={q.data} />;
}

function Editor({ profile }: { profile: ProviderProfile }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio);

  const save = useMutation({
    mutationFn: () => updateOwnProfile(profile.user_id, name.trim(), bio.trim()),
    onSuccess: () => {
      toast.success("Profile saved.");
      queryClient.invalidateQueries({ queryKey: ["own-provider"] });
      queryClient.invalidateQueries({ queryKey: ["provider", profile.user_id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-extrabold text-primary">Your provider profile</h2>
        <Link
          to="/pros/$id"
          params={{ id: profile.user_id }}
          className="text-sm font-semibold text-primary-bright hover:underline"
        >
          View public profile
        </Link>
      </div>
      {profile.verified ? (
        <p className="inline-flex items-center gap-1 text-sm font-semibold text-primary-bright">
          <BadgeCheck className="size-4" /> Verified by Mallick
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Want the "Verified by Mallick" badge? Message us on WhatsApp and we'll check your work.
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">Name customers see</span>
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">About you</span>
        <textarea
          rows={4}
          maxLength={1500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={inputCls}
          placeholder="Your experience, what you specialise in, languages you speak…"
        />
      </label>
      <button
        type="submit"
        disabled={save.isPending}
        className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-bright disabled:opacity-60"
      >
        {save.isPending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
