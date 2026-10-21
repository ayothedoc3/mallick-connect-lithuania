import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { fetchPublishedListings } from "@/lib/listings";

const BASE_URL = "https://mallickassistservice.com";

const SECTION = {
  item: "marketplace",
  service: "services",
  stay: "accommodation",
  hall: "hall-rentals",
} as const;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/services", changefreq: "monthly", priority: "0.9" },
          { path: "/accommodation", changefreq: "monthly", priority: "0.9" },
          { path: "/short-term-accommodation", changefreq: "monthly", priority: "0.9" },
          { path: "/long-term-accommodation", changefreq: "monthly", priority: "0.9" },
          { path: "/currency-exchange", changefreq: "monthly", priority: "0.8" },
          { path: "/hall-rentals", changefreq: "monthly", priority: "0.9" },
          { path: "/buying-selling", changefreq: "monthly", priority: "0.8" },
          { path: "/import-export", changefreq: "monthly", priority: "0.9" },
          { path: "/marketplace", changefreq: "daily", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.8" },
          { path: "/privacy", changefreq: "monthly", priority: "0.3" },
          { path: "/terms", changefreq: "monthly", priority: "0.3" },
          { path: "/cookies", changefreq: "monthly", priority: "0.3" },
        ];
        const services = await fetchPublishedListings("service");
        const listings = [
          ...(await fetchPublishedListings("item")),
          ...services,
          ...(await fetchPublishedListings("stay")),
          ...(await fetchPublishedListings("hall")),
        ];
        for (const l of listings) {
          entries.push({
            path: `/${SECTION[l.kind]}/${l.id}`,
            lastmod: l.created_at.slice(0, 10),
            changefreq: "weekly",
            priority: "0.6",
          });
        }
        for (const userId of new Set(services.map((l) => l.user_id))) {
          entries.push({ path: `/pros/${userId}`, changefreq: "weekly", priority: "0.6" });
        }
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
