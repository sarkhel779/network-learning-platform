begin;

create table public.pro_waitlist_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'joined' check (status in ('joined', 'unsubscribed')),
  source_lesson_slug text,
  consent_version text not null,
  consented_at timestamptz not null,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pro_waitlist_entries enable row level security;

create policy "learners read own waitlist entry"
on public.pro_waitlist_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.pro_waitlist_entries from authenticated;
grant select on public.pro_waitlist_entries to authenticated;

create function public.join_pro_waitlist(
  p_consent boolean,
  p_consent_version text,
  p_source_lesson_slug text default null
)
returns public.pro_waitlist_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_entry public.pro_waitlist_entries;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  if p_consent is distinct from true then
    raise exception 'consent_required';
  end if;

  if nullif(btrim(p_consent_version), '') is null then
    raise exception 'consent_version_required';
  end if;

  select u.email
  into v_email
  from auth.users as u
  where u.id = auth.uid();

  if v_email is null then
    raise exception 'verified_email_required';
  end if;

  insert into public.pro_waitlist_entries (
    user_id,
    email,
    status,
    source_lesson_slug,
    consent_version,
    consented_at,
    unsubscribed_at
  ) values (
    v_user_id,
    v_email,
    'joined',
    nullif(btrim(p_source_lesson_slug), ''),
    p_consent_version,
    now(),
    null
  )
  on conflict (user_id) do update
  set email = excluded.email,
      status = 'joined',
      source_lesson_slug = coalesce(
        excluded.source_lesson_slug,
        public.pro_waitlist_entries.source_lesson_slug
      ),
      consent_version = case
        when public.pro_waitlist_entries.status = 'joined'
          then public.pro_waitlist_entries.consent_version
        else excluded.consent_version
      end,
      consented_at = case
        when public.pro_waitlist_entries.status = 'joined'
          then public.pro_waitlist_entries.consented_at
        else excluded.consented_at
      end,
      unsubscribed_at = null,
      updated_at = now()
  returning * into v_entry;

  return v_entry;
end;
$$;

create function public.leave_pro_waitlist()
returns public.pro_waitlist_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_entry public.pro_waitlist_entries;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  update public.pro_waitlist_entries
  set status = 'unsubscribed',
      unsubscribed_at = now(),
      updated_at = now()
  where user_id = v_user_id
  returning * into v_entry;

  return v_entry;
end;
$$;

revoke all on function public.join_pro_waitlist(boolean, text, text) from public;
revoke all on function public.leave_pro_waitlist() from public;
grant execute on function public.join_pro_waitlist(boolean, text, text) to authenticated;
grant execute on function public.leave_pro_waitlist() to authenticated;

commit;
