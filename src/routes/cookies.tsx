import { createFileRoute } from "@tanstack/react-router";
import { ContactLine, LegalPage } from "@/components/LegalPage";
import { resetCookieConsent } from "@/lib/consent";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie policy | Mallick Assist Service" },
      {
        name: "description",
        content:
          "Which cookies and browser storage Mallick Assist Service uses, and how to change your choice.",
      },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/cookies" }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPage title="Cookie policy">
      <p>
        Cookies and similar browser storage are small pieces of data a website saves on your device.
        Here is what this site uses.
      </p>

      <h2>Always on (needed for the site to work)</h2>
      <ul>
        <li>
          <strong>Sign-in session</strong> (browser storage starting with "sb-"): keeps you signed
          in. Removed when you sign out.
        </li>
        <li>
          <strong>Your cookie choice</strong> ("mallick-analytics-consent"): remembers whether you
          accepted analytics, so we don't ask again.
        </li>
        <li>
          <strong>Security cookies from Cloudflare</strong> (such as "__cf_bm"): help block bots and
          attacks. They last up to 30 minutes.
        </li>
        <li>
          <strong>Stripe</strong> sets its own cookies on its payment page to prevent fraud when you
          pay a deposit or fee.
        </li>
      </ul>

      <h2>Only if you accept</h2>
      <ul>
        <li>
          <strong>Google Analytics</strong> ("_ga" and "_ga_…"): counts visits and shows us which
          pages are useful. They last up to 2 years. IP addresses are anonymised.
        </li>
      </ul>

      <h2>Change your choice</h2>
      <p>You can change your mind at any time. Your choice is cleared and you'll be asked again.</p>
      <p>
        <button
          type="button"
          onClick={resetCookieConsent}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-bright"
        >
          Change cookie settings
        </button>
      </p>
      <p>
        You can also delete cookies in your browser settings. Questions? <ContactLine />.
      </p>
    </LegalPage>
  );
}
