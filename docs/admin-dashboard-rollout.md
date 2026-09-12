# Admin dashboard rollout

The admin routes intentionally fail closed until the migration is applied and a staff role is assigned. Do not use a browser flag, test header, client-supplied role, or service-role key as a substitute for `public.staff_roles`.

1. Apply `supabase/migrations/202609120003_admin_foundation.sql` to a **disposable Supabase database** after earlier migrations. Run `supabase/tests/admin_foundation_rls.sql` with `psql -v ON_ERROR_STOP=1 -f ...` against that database. The SQL test wraps fixtures in a transaction and rolls back. Resolve any failure before applying the migration to production.
2. Apply both admin migrations, including `202609130001_page_view_ingest_guard.sql`, to the intended Supabase project through the normal reviewed migration process. Confirm the app's existing Supabase URL and anon key point to that project. Do not expose a service-role key to the app or browser.
3. Generate a random 32-byte-or-longer page-view ingestion token, store it as the server-only `PAGE_VIEW_INGEST_TOKEN` deployment secret, and set its hash in the intended database through a privileged SQL session. Never put the token itself in a migration, client environment variable, browser bundle, or log:

   ```sql
   insert into public.page_view_ingest_config (singleton, token_hash)
   values (true, md5('<same-random-server-only-token>'))
   on conflict (singleton) do update set token_hash = excluded.token_hash;
   ```

   Without matching configuration the page-view endpoint fails closed with 503. Rotate by changing the database hash and server secret together. The restricted token only authorizes page-view ingestion; it is not a Supabase service-role key. The database caps accepted views at 120 per minute across the site. This bounds a flood but does not identify unique people or guarantee bot-free counts, and excess legitimate traffic is not counted.
4. In the Supabase SQL editor, look up the exact user ID of the intended first administrator by their verified account email:

   ```sql
   select id, email, created_at from auth.users where email = '<verified-admin-email>';
   ```

   Confirm exactly one expected row, then assign the role manually as a privileged database operator. Replace the UUID below with the ID just verified:

   ```sql
   insert into public.staff_roles (user_id, role)
   values ('<verified-auth-user-uuid>', 'super_admin');
   ```

   Do not put this assignment in a migration or expose a self-promotion endpoint. Further role changes are operator-managed until a separately reviewed role-management workflow exists.
5. Sign in as the assigned account and verify `/admin` shows real counts; sign in as an ordinary learner and verify `/admin` remains inaccessible while `/dashboard` is personal. Test account edits, note append, and audit entries in a disposable environment before production use.

The overview's page-view figure starts at deployment of the recorder. It counts successful public-page navigation events, not unique visitors or historical traffic; a missing metric is shown as unavailable. Billing, support, course editing, and role management remain labeled unconnected and have no live mutation controls. Learner edits are limited to display name, learning level, and internal notes.
