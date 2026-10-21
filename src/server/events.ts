import { timingSafeEqual } from "node:crypto";
import { HttpError, getPrivateSettings, supabaseAdmin, type PrivateSettings } from "./admin";
import { notifyStaff, sendEmail } from "./messaging";

const KIND_LABEL: Record<string, string> = {
  item: "item",
  service: "service",
  stay: "stay",
  hall: "hall",
};
const PUBLIC_PATH: Record<string, string> = {
  item: "marketplace",
  service: "services",
  stay: "accommodation",
  hall: "hall-rentals",
};

const euro = (n: number | null) => (n === null ? "price on request" : `€${Number(n)}`);

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Handles a database event sent by private.notify(). */
export async function handleDbEvent(request: Request) {
  const s = await getPrivateSettings();
  if (!sameSecret(request.headers.get("x-hook-secret") ?? "", s.hooks_secret)) {
    throw new HttpError(401, "Bad hook secret.");
  }
  const { event, id } = (await request.json()) as { event: string; id: string };
  switch (event) {
    case "listing_submitted":
      return listingSubmitted(s, id);
    case "listing_status":
      return listingStatus(s, id);
    case "request_created":
      return requestCreated(s, id);
    case "review_submitted":
      return reviewSubmitted(s, id);
    default:
      throw new HttpError(400, `Unknown event ${event}`);
  }
}

async function getListing(id: string) {
  const { data, error } = await supabaseAdmin().from("listings").select("*").eq("id", id).single();
  if (error) throw error;
  return data as {
    id: string;
    user_id: string;
    kind: string;
    title: string;
    price_eur: number | null;
    status: string;
    seller_name: string | null;
    category: string;
  };
}

async function listingSubmitted(s: PrivateSettings, id: string) {
  const l = await getListing(id);
  await notifyStaff(
    {
      subject: `New ${KIND_LABEL[l.kind]} to review: ${l.title}`,
      lines: [
        `New ${KIND_LABEL[l.kind]} waiting for review`,
        `"${l.title}" (${l.category}, ${euro(l.price_eur)})`,
        `From ${l.seller_name || "a user"}`,
      ],
      link: { label: "Review in admin", url: `${s.site_url}/precious?tab=listings` },
    },
    s,
  );
}

async function listingStatus(s: PrivateSettings, id: string) {
  const l = await getListing(id);
  if (l.kind === "stay" || l.kind === "hall") return; // staff-managed
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(l.user_id);
  if (error) throw error;
  const email = data.user.email;
  if (!email) return;
  const live = l.status === "published";
  await sendEmail(s, [email], {
    subject: live ? `Your listing is live: ${l.title}` : `Your listing wasn't approved: ${l.title}`,
    lines: live
      ? [
          `"${l.title}" is now live on Mallick Assist Service.`,
          "Share the link with friends to find a buyer faster.",
        ]
      : [
          `"${l.title}" wasn't approved.`,
          "Message us on WhatsApp if you'd like to know why or need help fixing it.",
        ],
    link: live
      ? { label: "View your listing", url: `${s.site_url}/${PUBLIC_PATH[l.kind]}/${l.id}` }
      : { label: "My listings", url: `${s.site_url}/my-listings` },
  });
}

async function requestCreated(s: PrivateSettings, id: string) {
  const { data: r, error } = await supabaseAdmin()
    .from("service_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  await notifyStaff(
    {
      subject: `New request: ${r.service} from ${r.name}`,
      lines: [
        `New ${r.service} request`,
        `${r.name}, WhatsApp ${r.whatsapp}`,
        ...(r.message ? [`"${r.message}"`] : []),
      ],
      link: { label: "Open requests", url: `${s.site_url}/precious?tab=requests` },
    },
    s,
  );
}

async function reviewSubmitted(s: PrivateSettings, id: string) {
  const { data: r, error } = await supabaseAdmin()
    .from("reviews")
    .select("rating, body, author_name, provider_profiles(display_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  const provider = (r.provider_profiles as unknown as { display_name: string }).display_name;
  await notifyStaff(
    {
      subject: `New ${r.rating}-star review for ${provider}`,
      lines: [`New review for ${provider}: ${r.rating}/5`, `"${r.body}"`, `By ${r.author_name}`],
      link: { label: "Approve reviews", url: `${s.site_url}/precious?tab=reviews` },
    },
    s,
  );
}
