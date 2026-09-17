begin;

alter table public.page_views
  add column visitor_id uuid;

create index page_views_visitor_created_idx on public.page_views(visitor_id, created_at);

revoke all on function public.record_page_view(uuid, text, text) from public, anon, authenticated;
drop function public.record_page_view(uuid, text, text);

create function public.record_page_view(p_event_id uuid, p_path text, p_ingest_token text, p_visitor_id uuid)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  v_token_hash text;
  v_window timestamptz := date_trunc('minute', now());
  v_accepted integer;
begin
  select token_hash into v_token_hash
  from public.page_view_ingest_config where singleton = true;
  if p_ingest_token is null or char_length(p_ingest_token) not between 32 and 256 or
     v_token_hash is null or v_token_hash is distinct from pg_catalog.md5(p_ingest_token) then
    raise insufficient_privilege;
  end if;
  if p_event_id is null or p_path is null or char_length(p_path) > 200 or
     p_path !~ '^(/|/(about|pricing|labs|contact|privacy|terms|sign-in)(/[a-z0-9-]+)*|/(paths|learn)/[a-z0-9-]+(/[a-z0-9-]+)*)$' then
    raise exception 'invalid_page_view';
  end if;
  if exists (select 1 from public.page_views where event_id = p_event_id) then
    return 'duplicate';
  end if;

  insert into public.page_view_ingest_windows(window_start, accepted_count)
  values (v_window, 1)
  on conflict (window_start) do update
    set accepted_count = public.page_view_ingest_windows.accepted_count + 1
    where public.page_view_ingest_windows.accepted_count < 120
  returning accepted_count into v_accepted;
  if v_accepted is null then
    return 'rate_limited';
  end if;

  insert into public.page_views(event_id, path, visitor_id)
  values (p_event_id, p_path, p_visitor_id)
  on conflict (event_id) do nothing;
  return 'recorded';
end;
$$;

revoke all on function public.record_page_view(uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.record_page_view(uuid, text, text, uuid) to anon, authenticated;

create function public.admin_unique_visitor_count(p_from timestamptz, p_to timestamptz)
returns bigint
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.admin_staff_role() is null then
    raise insufficient_privilege;
  end if;
  if p_from is null or p_to is null or p_to <= p_from or p_to > now() + interval '1 day' then
    raise exception 'invalid_page_view_range';
  end if;
  return (
    select count(distinct visitor_id) from public.page_views
    where created_at >= p_from and created_at < p_to and visitor_id is not null
  );
end;
$$;

revoke all on function public.admin_unique_visitor_count(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_unique_visitor_count(timestamptz, timestamptz) to authenticated;

commit;
