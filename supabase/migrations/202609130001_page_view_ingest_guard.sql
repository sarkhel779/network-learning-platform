begin;

create table public.page_view_ingest_config (
  singleton boolean primary key default true check (singleton),
  token_hash text not null check (char_length(token_hash) = 32)
);

create table public.page_view_ingest_windows (
  window_start timestamptz primary key,
  accepted_count integer not null check (accepted_count between 1 and 120)
);

alter table public.page_view_ingest_config enable row level security;
alter table public.page_view_ingest_windows enable row level security;
revoke all on public.page_view_ingest_config from anon, authenticated;
revoke all on public.page_view_ingest_windows from anon, authenticated;

revoke all on function public.record_page_view(uuid, text) from public, anon, authenticated;
drop function public.record_page_view(uuid, text);

create function public.record_page_view(p_event_id uuid, p_path text, p_ingest_token text)
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

  insert into public.page_views(event_id, path)
  values (p_event_id, p_path)
  on conflict (event_id) do nothing;
  return 'recorded';
end;
$$;

revoke all on function public.record_page_view(uuid, text, text) from public, anon, authenticated;
grant execute on function public.record_page_view(uuid, text, text) to anon, authenticated;

commit;
