import { useEffect, useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const mediaUrl = (path: string) =>
  supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;

export const FOUNDER_VIDEOS = {
  mission: { src: "founder/founder-mission.mp4", poster: "founder/founder-mission.jpg" },
  intro: { src: "founder/founder-intro.mp4", poster: "founder/founder-intro.jpg" },
} as const;

interface Props {
  video: keyof typeof FOUNDER_VIDEOS;
  /** Accessible name, e.g. "Our founder on helping students settle in Vilnius". */
  label: string;
  /**
   * Play silently on large screens as a preview (the video has burned-in captions).
   * Never on phones (data) or when the visitor prefers reduced motion.
   */
  preview?: boolean;
  className?: string;
}

/** Vertical founder video. Starts with a poster; one tap plays it with sound from the start. */
export function FounderVideo({ video, label, preview = false, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"idle" | "preview" | "playing">("idle");
  const { src, poster } = FOUNDER_VIDEOS[video];

  useEffect(() => {
    if (!preview) return;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || calm || !ref.current) return;
    ref.current.muted = true;
    ref.current.play().then(
      () => setState("preview"),
      () => setState("idle"),
    );
  }, [preview]);

  function playWithSound() {
    const el = ref.current!;
    el.muted = false;
    el.currentTime = 0;
    el.play();
    setState("playing");
  }

  return (
    <div
      className={cn(
        "relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-black shadow-card ring-1 ring-white/10",
        className,
      )}
    >
      <video
        ref={ref}
        src={mediaUrl(src)}
        poster={mediaUrl(poster)}
        playsInline
        loop={state === "preview"}
        controls={state === "playing"}
        preload={preview ? "metadata" : "none"}
        aria-label={label}
        className="size-full object-cover"
      />
      {state !== "playing" && (
        <button
          type="button"
          onClick={playWithSound}
          className="group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent p-5 text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-soft transition group-hover:brightness-105">
            {state === "preview" ? (
              <>
                <Volume2 className="size-4" /> Watch with sound
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" /> Watch video
              </>
            )}
          </span>
          <span className="sr-only">{label}</span>
        </button>
      )}
    </div>
  );
}
