import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star rating, e.g. 4.5 → four and a half filled stars. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="relative inline-block size-4">
          <Star className="absolute inset-0 size-4 text-accent/40" />
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${Math.max(0, Math.min(1, value - i + 1)) * 100}%` }}
          >
            <Star className="size-4 fill-accent text-accent" />
          </span>
        </span>
      ))}
    </span>
  );
}

/** Clickable 1–5 star picker for review forms. */
export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i)}
          className="rounded p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-bright"
        >
          <Star
            className={cn("size-7", i <= value ? "fill-accent text-accent" : "text-accent/40")}
          />
        </button>
      ))}
    </div>
  );
}
