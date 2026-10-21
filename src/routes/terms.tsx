import { createFileRoute, Link } from "@tanstack/react-router";
import { ContactLine, LegalPage, Operator } from "@/components/LegalPage";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use | Mallick Assist Service" },
      {
        name: "description",
        content:
          "The rules for using Mallick Assist Service, its marketplace, local pros and bookings.",
      },
    ],
    links: [{ rel: "canonical", href: "https://mallickassistservice.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const s = useSiteSettings();
  return (
    <LegalPage title="Terms of use">
      <p>
        These terms apply when you use mallickassistservice.com, run by <Operator /> ("we"). By
        creating an account, listing something or making a booking, you agree to them.
      </p>

      <h2>What we do</h2>
      <p>
        We provide support services in Lithuania, such as help with accommodation, event halls,
        currency exchange and shipping. We also run a community marketplace for items and a
        directory of local service providers. For marketplace items and local pros' services, we
        connect you with the other person; the deal itself is between you and them. We check
        listings before they go live but can't guarantee every item or service.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be 18 or older and give accurate details.</li>
        <li>Keep your password private. You're responsible for what happens in your account.</li>
        <li>We may suspend accounts that break these terms.</li>
      </ul>

      <h2>Listings</h2>
      <ul>
        <li>
          Only list items you own or services you provide yourself, with honest descriptions and
          real photos.
        </li>
        <li>
          Not allowed: anything illegal, weapons, drugs, counterfeit or stolen goods, adult content,
          animals, and misleading or duplicate listings.
        </li>
        <li>
          We review every listing and may reject, edit or remove any listing without giving a
          reason.
        </li>
        <li>If you change a live listing, it goes back for review.</li>
      </ul>

      <h2>Reviews</h2>
      <p>
        Reviews must describe your own genuine experience. We check reviews before they appear and
        remove any that are fake, abusive or off-topic.
      </p>

      <h2>Featured listings</h2>
      <p>
        You can pay to show a live listing first, with a "Featured" badge, for the period shown when
        you pay. Once the placement starts, the fee isn't refundable. Featured placement is
        advertising, not a recommendation from us.
      </p>

      <h2>Bookings and deposits</h2>
      <p>
        Stays and halls can be booked online by paying a deposit through Stripe. Your booking is
        confirmed when the deposit is paid. The rest is paid on arrival.
      </p>
      <p>{s.booking_terms}</p>

      <h2>Payments</h2>
      <p>
        Prices are in euros. Card payments are processed securely by Stripe; see our{" "}
        <Link to="/privacy">privacy policy</Link> for how payment data is handled.
      </p>

      <h2>Liability</h2>
      <p>
        We are responsible for the services we provide ourselves. We aren't responsible for items or
        services sold by other users, beyond what the law requires. Nothing in these terms limits
        your rights as a consumer under Lithuanian or EU law.
      </p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by Lithuanian law. If something goes wrong, <ContactLine /> and
        we'll try to fix it. Consumers can also turn to Lithuania's State Consumer Rights Protection
        Authority (Valstybinė vartotojų teisių apsaugos tarnyba) at{" "}
        <a href="https://vvtat.lt" target="_blank" rel="noreferrer">
          vvtat.lt
        </a>{" "}
        for free out-of-court dispute resolution.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version.</p>
    </LegalPage>
  );
}
