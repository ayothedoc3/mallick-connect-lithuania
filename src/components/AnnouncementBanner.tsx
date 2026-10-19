import { useSiteSettings } from "@/lib/settings";

export function AnnouncementBanner() {
  const { banner_enabled, banner_text } = useSiteSettings();
  if (!banner_enabled || !banner_text.trim()) return null;
  return (
    <div className="bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">
      {banner_text}
    </div>
  );
}
