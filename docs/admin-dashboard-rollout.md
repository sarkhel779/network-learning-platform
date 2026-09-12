# Admin dashboard rollout

The admin routes intentionally fail closed until the migration is applied and a staff role is assigned. Do not use a browser flag, test header, client-supplied role, or service-role key as a substitute for `public.staff_roles`.

1. Apply `supabase/migrations/202609120003_admin_foundation.sql` to a **disposable Supabase database** after earlier migrations. Run `supabase/tests/admin_foundation_rls.sql` with `psql -v ON_ERROR_STOP=1 -f ...` against that database. The SQL test wraps fixtures in a transaction and rolls back. Resolve any failure before applying the migration to production.
2. Apply the migration to the intended Supabase project through the normal reviewed migration process. Confirm the app's existing Supabase URL and anon key point to that project. Do not expose a service-role key to the app or browser.
3. In the Supabase SQL editor, look up the exact user ID of the intended first administrator by their verified account email:

   ```sql
   select id, email, created_at from auth.users where email = '<verified-admin-email>';
   ```

   Confirm exactly one expected row, then assign the role manually as a privileged database operator. Replace the UUID below with the ID just verified:

   ```sql
   insert into public.staff_roles (user_id, role)
   values ('<verified-auth-user-uuid>', 'super_admin');
   ```

   Do not put this assignment in a migration or expose a self-promotion endpoint. Further role changes are operator-managed until a separately reviewed role-management workflow exists.
4. Sign in as the assigned account and verify `/admin` shows real counts; sign in as an ordinary learner and verify `/admin` remains inaccessible while `/dashboard` is personal. Test account edits, note append, and audit entries in a disposable environment before production use.

The overview's page-view figure starts at deployment of the recorder. It counts successful public-page navigation events, not unique visitors or historical traffic; a missing metric is shown as unavailable. Billing, support, course editing, and role management remain labeled unconnected and have no live mutation controls. Learner edits are limited to display name, learning level, and internal notes.
