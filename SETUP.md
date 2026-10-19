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
Run `supabase/admin.sql` after `schema.sql`. It adds admins, site settings (contact details and
announcement banner) and the service-requests inbox. The site needs the `site_settings` row to load.

To make someone an admin, they sign up on the site first, then run in the SQL editor:

```sql
insert into public.admins (user_id) select id from auth.users where email = 'their@email.com';
```

They then sign in at `/precious` to approve, reject, mark sold or delete listings, see users,
read service requests, and edit contact details and the banner. New listings start as
**pending** and are invisible to the public until approved.

## Notes
- Buyers tap **Ask about this item**, which opens WhatsApp to the Mallick number with the item
  name and link. Sellers' phone numbers are never shown publicly.
- Limits: 8 photos (10 MB each), 2 videos (50 MB each). 50 MB is the Supabase free-plan cap per file.
- Files are public by URL once uploaded, even while a listing is pending.
- `src/routeTree.gen.ts` regenerates itself on the next build/dev run to include the new pages.

## Not included yet
Password reset, editing an existing listing, and deleting user accounts from the admin panel.
