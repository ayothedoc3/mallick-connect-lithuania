# Marketplace setup (accounts + uploads)

The site now has sign-up/sign-in, a marketplace, and a "Sell an item" form where
logged-in users upload photos, videos and a description. Everything is stored in
[Supabase](https://supabase.com) (free plan is enough to start).

## 1. Create the Supabase project
1. Sign up at supabase.com and create a new project (pick a region close to Lithuania, e.g. Frankfurt).
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, and press **Run**.
   This creates the tables, security rules and the `listing-media` storage bucket.

## 2. Configure sign-in links
In Supabase: **Authentication → URL Configuration**
- **Site URL**: `https://mallickassistservice.com`
- **Redirect URLs**: add `https://mallickassistservice.com/**` (and your Lovable preview URL if you use one).

By default Supabase emails a confirmation link on sign-up. You can turn this off under
**Authentication → Sign In / Providers → Email** while testing.

## 3. Give the site its keys
Supabase: **Project Settings → API** → copy the **Project URL** and the **anon / publishable key**.
Add them as environment variables where the site is built:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | the Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the anon / publishable key |

- **Coolify**: add both under Environment Variables and tick **Build Variable**, then redeploy.
  (Vite bakes these into the site at build time, so a rebuild is required after any change.)
- **Lovable**: add them as project environment variables.

Never use the `service_role` key in the site.

## 4. Admin panel (/precious)
Run `supabase/admin.sql` after `schema.sql`. It adds staff roles, site settings (contact details,
announcement banner, Google Analytics ID) and the service-requests inbox. The site needs the
`site_settings` row to load. Databases created before staff roles existed: run
`supabase/migrations/2026-10-19-staff-roles.sql` once first.

Make the first admin (they sign up on the site first), in the SQL editor:

```sql
insert into public.staff (user_id, role) select id, 'admin' from auth.users where email = 'their@email.com';
```

After that, admins add managers and other admins from **/precious → Users & staff**.

| Role | Can do |
| --- | --- |
| Manager | Approve, reject, mark sold and delete listings; handle service requests |
| Admin | Everything a manager can, plus users, staff roles, site settings and analytics |

New listings start as **pending** and are invisible to the public until approved. If a seller
edits an approved listing, it goes back to pending.

## Local services
The same listings table holds items (`kind = 'item'`, shown on /marketplace) and services
(`kind = 'service'`, shown under "Local pros" on /services). Providers choose "A service I offer"
on /sell. Services have a starting price and what it's charged per (`price_unit`). Approval,
photos, videos and the admin panel work the same for both.

## 5. Google Analytics
Admins paste the GA4 Measurement ID (`G-...`) in **/precious → Site settings**. Visitors are
asked for cookie consent first and GA only loads if they accept.

## Notes
- Buyers tap **Ask about this item**, which opens WhatsApp to the Mallick number with the item
  name and link. Sellers' phone numbers are never shown publicly.
- Limits: 8 photos (10 MB each), 2 videos (50 MB each). 50 MB is the Supabase free-plan cap per file.
- Files are public by URL once uploaded, even while a listing is pending.
- `src/routeTree.gen.ts` regenerates itself on the next build/dev run to include the new pages.

## 6. Payments, bookings and featured listings
Run `supabase/platform.sql` after `admin.sql`. It adds private settings (keys), alerts,
provider profiles, reviews and bookings. The server needs `SUPABASE_SERVICE_ROLE_KEY` as a
runtime environment variable (not a build variable) to read the private settings.

Stripe (in **/precious → Integrations**):
1. Paste the **secret key** (`sk_live_...`) from Stripe → Developers → API keys.
2. In Stripe → Developers → Webhooks, add the endpoint `https://mallickassistservice.com/api/stripe/webhook`
   with the events `checkout.session.completed` and `checkout.session.expired`.
3. Paste the webhook's **signing secret** (`whsec_...`).

Once both are saved, "Feature it" buttons and the deposit booking calendar appear. Staff add
stays and halls from **/precious → Listings → Add a stay / Add a hall**, with a price, capacity
and deposit. A booking holds its dates for 31 minutes while the customer pays; double bookings
are blocked by the database. Refunds are made in the Stripe dashboard.

## 7. Email and Telegram alerts
- **Resend**: create an account, add the domain `mallickassistservice.com` and the DNS records it
  shows in Cloudflare, then paste the API key and the "from" address (for example
  `Mallick Assist Service <hello@mallickassistservice.com>`) in **Integrations**.
  Password reset emails are sent through the site (`/api/hooks/auth-email`), so they only work
  once Resend is set up.
- **Telegram**: create a bot with @BotFather, send it a message, then paste the bot token and your
  chat ID in **Integrations**. "Send a test alert" checks both channels.
- Staff get alerts for new listings, service requests, reviews and paid bookings. Sellers get an
  email when their listing is approved or rejected.

## 8. Legal pages
/privacy, /terms and /cookies read the company name, registration number (Įmonės kodas),
address, contact email and booking terms from **/precious → Site settings**. Fill these in and
have a lawyer review the wording.

## 9. Backups and uptime
- `infra/backup.sh` runs in the `db-backup` container of the Supabase service
  (`infra/backup-service.yaml`). Every 24 hours it saves the database and uploaded files to
  `volumes/backups/<date>/` on the server and keeps 14 days. Copy them off the server too
  (for example to Cloudflare R2) so a server failure doesn't take the backups with it.
  Restore: `pg_restore -h supabase-db -U supabase_admin -d postgres --clean postgres.dump`.
- `.github/workflows/uptime.yml` checks the site every 10 minutes. GitHub emails the repo owner
  when a run fails. GitHub pauses scheduled workflows after 60 days without commits; re-enable it
  under Actions if that happens.

## Not included yet
Deleting user accounts from the admin panel.
