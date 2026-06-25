export const SITE = {
  name: "Mallick Assist Service",
  phone: "+37062434541",
  phoneDisplay: "+370 624 34541",
  whatsappBase: "https://wa.me/37062434541",
  city: "Vilnius, Lithuania",
  tiktok: "https://www.tiktok.com/@mallickinternational20",
  tiktokHandle: "@mallickinternational20",
};

export function waLink(message: string) {
  return `${SITE.whatsappBase}?text=${encodeURIComponent(message)}`;
}

export const SERVICES = [
  {
    slug: "short-term-accommodation",
    title: "Short Term Accommodation",
    short: "Comfortable short stays for visitors, students, and travelers across Lithuania.",
    icon: "bed",
  },
  {
    slug: "long-term-accommodation",
    title: "Long Term Accommodation",
    short: "Reliable long-term housing for migrants, students and families settling in.",
    icon: "home",
  },
  {
    slug: "currency-exchange",
    title: "Currency Exchange Assistance",
    short: "Guidance and trusted contacts for safe currency exchange.",
    icon: "exchange",
  },
  {
    slug: "hall-rentals",
    title: "Hall Rentals",
    short: "Event halls for weddings, birthdays, conferences and community events.",
    icon: "hall",
  },
  {
    slug: "buying-selling",
    title: "Buying & Selling Items",
    short: "Connecting buyers and sellers in the diaspora community.",
    icon: "cart",
  },
  {
    slug: "import-export",
    title: "Import & Export",
    short: "Shipping and customs support for goods in and out of Lithuania.",
    icon: "globe",
  },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]["slug"];
