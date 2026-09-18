begin;

revoke all on function public.admin_list_learners(text, integer, integer) from public, anon, authenticated;
drop function public.admin_list_learners(text, integer, integer);

create function public.admin_list_learners(
  p_query text default '',
  p_offset integer default 0,
  p_limit integer default 20,
  p_waitlist_status text default null,
  p_joined_from timestamptz default null,
  p_joined_to timestamptz default null
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_query text := left(btrim(coalesce(p_query, '')), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_waitlist_status text := nullif(btrim(coalesce(p_waitlist_status, '')), '');
  v_total bigint;
  v_rows jsonb;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  if v_waitlist_status is not null and v_waitlist_status not in ('joined', 'unsubscribed', 'none') then
    raise exception 'invalid_waitlist_status';
  end if;
  if p_joined_from is not null and p_joined_to is not null and p_joined_to <= p_joined_from then
    raise exception 'invalid_joined_range';
  end if;

  select count(*) into v_total
  from auth.users u
  left join public.learner_profiles p on p.id = u.id
  left join public.pro_waitlist_entries w on w.user_id = u.id
  where (v_query = '' or u.email ilike '%' || v_query || '%' or p.display_name ilike '%' || v_query || '%')
    and (v_waitlist_status is null
      or (v_waitlist_status = 'none' and w.status is null)
      or w.status = v_waitlist_status)
    and (p_joined_from is null or u.created_at >= p_joined_from)
    and (p_joined_to is null or u.created_at < p_joined_to);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'displayName', p.display_name,
    'learningLevel', p.learning_level,
    'createdAt', u.created_at,
    'waitlistStatus', w.status
  ) order by u.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select u.id, u.email, u.created_at
    from auth.users u
    left join public.learner_profiles p on p.id = u.id
    left join public.pro_waitlist_entries w on w.user_id = u.id
    where (v_query = '' or u.email ilike '%' || v_query || '%' or p.display_name ilike '%' || v_query || '%')
      and (v_waitlist_status is null
        or (v_waitlist_status = 'none' and w.status is null)
        or w.status = v_waitlist_status)
      and (p_joined_from is null or u.created_at >= p_joined_from)
      and (p_joined_to is null or u.created_at < p_joined_to)
    order by u.created_at desc
    offset v_offset limit v_limit
  ) u
  left join public.learner_profiles p on p.id = u.id
  left join public.pro_waitlist_entries w on w.user_id = u.id;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

revoke all on function public.admin_list_learners(text, integer, integer, text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_list_learners(text, integer, integer, text, timestamptz, timestamptz) to authenticated;

commit;
