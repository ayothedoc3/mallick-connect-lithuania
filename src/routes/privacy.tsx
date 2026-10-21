import { createFileRoute, Link } from "@tanstack/react-router";
import { ContactLine, LegalPage, Operator } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | Mallick Assist Service" },
      {
        name: "description",
        content: "How Mallick Assist Service collects, uses and protects your personal data.",
      },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        This policy explains what personal data we collect when you use mallickassistservice.com,
        why, and what rights you have under the EU General Data Protection Regulation (GDPR).
      </p>

      <h2>Who we are</h2>
      <p>
        The site is run by <Operator />, based in Vilnius, Lithuania ("we"). We are the data
        controller for the data described here. To ask anything about your data, <ContactLine />.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account:</strong> email address, name and WhatsApp number. Your password is
          stored only in scrambled (hashed) form.
        </li>
        <li>
          <strong>Listings:</strong> the text, prices, photos and videos you post. Once approved, a
          listing is public, including the first name shown with it.
        </li>
        <li>
          <strong>Service requests:</strong> your name, WhatsApp number, the service you need and
          your message.
        </li>
        <li>
          <strong>Bookings:</strong> your name, WhatsApp number, email, dates, number of guests and
          notes. Card payments are handled by Stripe; we never see your full card number.
        </li>
        <li>
          <strong>Reviews:</strong> your rating, text and the name you show with it, which are
          public once approved.
        </li>
        <li>
          <strong>WhatsApp conversations</strong> you start with us.
        </li>
        <li>
          <strong>Usage data:</strong> only if you accept analytics cookies, Google Analytics
          records the pages you visit, your device type and approximate location. See our{" "}
          <Link to="/cookies">cookie policy</Link>.
        </li>
        <li>
          <strong>Technical logs:</strong> IP address and browser details, kept briefly to keep the
          site secure.
        </li>
      </ul>

      <h2>Why we use it, and on what legal basis</h2>
      <ul>
        <li>
          <strong>To provide what you asked for</strong> (contract): your account, listings,
          connecting buyers, sellers and providers, requests and bookings.
        </li>
        <li>
          <strong>Legitimate interests:</strong> keeping the site secure, preventing fraud and
          checking listings and reviews before they go live.
        </li>
        <li>
          <strong>Consent:</strong> analytics cookies. You can change your mind at any time on our{" "}
          <Link to="/cookies">cookie policy</Link> page.
        </li>
        <li>
          <strong>Legal obligation:</strong> keeping payment and accounting records.
        </li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        When you ask about an item, service, stay or hall, we pass the contact details needed to
        arrange it to the other person involved. We never sell your data. We use these providers to
        run the site:
      </p>
      <ul>
        <li>our hosting provider, which runs the servers for the site and its database;</li>
        <li>Cloudflare, which delivers the site and protects it from attacks;</li>
        <li>Stripe, for deposits and payments;</li>
        <li>Resend, which sends our emails;</li>
        <li>Telegram, which sends our team instant alerts about new requests and bookings;</li>
        <li>Google Analytics, only if you accept analytics cookies;</li>
        <li>WhatsApp (Meta), when you message us there.</li>
      </ul>
      <p>
        Some of these providers process data outside the European Economic Area. Where they do,
        transfers are covered by the European Commission's standard contractual clauses or
        equivalent safeguards.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account data: while you have an account. Ask us and we'll delete it.</li>
        <li>
          Listings: until you or we delete them. Photos and videos are deleted with the listing.
        </li>
        <li>Service requests: up to 24 months.</li>
        <li>Bookings and payment records: as long as Lithuanian accounting law requires.</li>
        <li>Analytics data: up to 14 months.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask us to show you the data we hold about you, correct it, delete it, limit how we
        use it, or give it to you in a portable format. You can object to processing based on our
        legitimate interests and withdraw consent at any time. To do any of this, <ContactLine />.
        We reply within one month.
      </p>
      <p>
        If you're unhappy with how we handle your data, you can complain to Lithuania's data
        protection authority, the State Data Protection Inspectorate (Valstybinė duomenų apsaugos
        inspekcija), at{" "}
        <a href="https://vdai.lrv.lt" target="_blank" rel="noreferrer">
          vdai.lrv.lt
        </a>
        .
      </p>

      <h2>Age</h2>
      <p>You must be 18 or older to create an account, list something or make a booking.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we'll update the date at the top of this page. Significant changes
        will be announced on the site.
      </p>
    </LegalPage>
  );
}
