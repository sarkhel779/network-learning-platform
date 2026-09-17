begin;

create function public.admin_list_waitlist(p_offset integer default 0, p_limit integer default 20)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_total bigint;
  v_rows jsonb;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;

  select count(*) into v_total from public.pro_waitlist_entries where status = 'joined';

  select coalesce(jsonb_agg(jsonb_build_object(
    'userId', w.user_id, 'email', w.email, 'displayName', p.display_name,
    'sourceLessonSlug', w.source_lesson_slug,
    'consentedAt', w.consented_at, 'createdAt', w.created_at
  ) order by w.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select * from public.pro_waitlist_entries
    where status = 'joined'
    order by created_at desc
    offset v_offset limit v_limit
  ) w
  left join public.learner_profiles p on p.id = w.user_id;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

revoke all on function public.admin_list_waitlist(integer, integer) from public, anon, authenticated;
grant execute on function public.admin_list_waitlist(integer, integer) to authenticated;

commit;
