import {
  Bed,
  Home,
  ArrowLeftRight,
  PartyPopper,
  ShoppingCart,
  Globe2,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  bed: Bed,
  home: Home,
  exchange: ArrowLeftRight,
  hall: PartyPopper,
  cart: ShoppingCart,
  globe: Globe2,
};

// Lucide has no TikTok brand mark, so we ship a small inline one.
export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.5 3c.3 2.1 1.6 3.6 3.5 3.9v2.5c-1.2.1-2.4-.2-3.5-.8v5.9c0 3.3-2.6 5.5-5.5 5.5S5.5 17.7 5.5 14.9c0-2.9 2.4-5.1 5.3-4.9v2.6c-1.4-.3-2.7.7-2.7 2.2 0 1.4 1.1 2.4 2.4 2.4 1.4 0 2.5-1.1 2.5-2.6V3h3.5z" />
    </svg>
  );
}
