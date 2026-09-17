begin;

create table public.billing_plans (
  id text primary key check (id ~ '^[a-z0-9_]+$'),
  name text not null check (char_length(name) between 1 and 80),
  billing_interval text not null check (billing_interval in ('monthly', 'annual')),
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Placeholder plans: no payment gateway is connected yet, so price_cents is
-- left null until a real gateway price is attached.
insert into public.billing_plans (id, name, billing_interval, price_cents)
values
  ('pro_monthly', 'Pro Monthly', 'monthly', null),
  ('pro_annual', 'Pro Annual', 'annual', null);

create table public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.billing_plans(id),
  status text not null default 'active' check (status in ('active', 'canceled')),
  source text not null default 'manual' check (source in ('manual', 'gateway')),
  external_customer_id text,
  external_subscription_id text,
  granted_by uuid references auth.users(id),
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One active subscription per learner; granting a new plan while one is
-- already active updates it in place rather than creating a second row.
create unique index subscriptions_one_active_per_user on public.subscriptions(user_id) where status = 'active';
create index subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.billing_plans enable row level security;
alter table public.subscriptions enable row level security;
revoke all on public.billing_plans from anon, authenticated;
revoke all on public.subscriptions from anon, authenticated;

create function public.admin_list_billing_plans()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
begin
  if v_role not in ('super_admin', 'finance') or v_role is null then
    raise insufficient_privilege;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', id, 'name', name, 'billingInterval', billing_interval,
      'priceCents', price_cents, 'currency', currency
    ) order by billing_interval, id)
    from public.billing_plans
  ), '[]'::jsonb);
end;
$$;

create function public.admin_list_subscriptions(p_status text default null, p_offset integer default 0, p_limit integer default 20)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_status text := nullif(btrim(coalesce(p_status, '')), '');
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_total bigint;
  v_rows jsonb;
begin
  if v_role not in ('super_admin', 'finance') or v_role is null then
    raise insufficient_privilege;
  end if;
  if v_status is not null and v_status not in ('active', 'canceled') then
    raise exception 'invalid_status_filter';
  end if;

  select count(*) into v_total
  from public.subscriptions s
  where v_status is null or s.status = v_status;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id, 'learnerId', s.user_id, 'learnerEmail', u.email,
    'planId', s.plan_id, 'status', s.status, 'source', s.source,
    'currentPeriodEnd', s.current_period_end,
    'createdAt', s.created_at, 'canceledAt', s.canceled_at
  ) order by s.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select * from public.subscriptions
    where v_status is null or status = v_status
    order by created_at desc
    offset v_offset limit v_limit
  ) s
  join auth.users u on u.id = s.user_id;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

create function public.admin_grant_subscription(p_email text, p_plan_id text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_target_id uuid;
  v_subscription public.subscriptions;
begin
  if v_role not in ('super_admin', 'finance') or v_role is null then
    raise insufficient_privilege;
  end if;
  if not exists (select 1 from public.billing_plans where id = p_plan_id) then
    raise exception 'invalid_plan';
  end if;

  select id into v_target_id from auth.users where email = lower(btrim(p_email));
  if v_target_id is null then
    raise exception 'learner_account_not_found';
  end if;

  update public.subscriptions
  set plan_id = p_plan_id, source = 'manual', granted_by = v_actor,
      canceled_at = null, updated_at = now()
  where user_id = v_target_id and status = 'active'
  returning * into v_subscription;

  if v_subscription.id is null then
    insert into public.subscriptions(user_id, plan_id, status, source, granted_by)
    values (v_target_id, p_plan_id, 'active', 'manual', v_actor)
    returning * into v_subscription;
  end if;

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, v_target_id, 'subscription_granted', null, jsonb_build_object('planId', p_plan_id, 'subscriptionId', v_subscription.id));

  return jsonb_build_object('id', v_subscription.id, 'learnerId', v_target_id, 'planId', p_plan_id, 'status', 'active');
end;
$$;

create function public.admin_revoke_subscription(p_subscription_id bigint)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_learner_id uuid;
begin
  if v_role not in ('super_admin', 'finance') or v_role is null then
    raise insufficient_privilege;
  end if;

  select user_id into v_learner_id from public.subscriptions where id = p_subscription_id and status = 'active' for update;
  if v_learner_id is null then
    raise exception 'subscription_not_found';
  end if;

  update public.subscriptions
  set status = 'canceled', canceled_at = now(), updated_at = now()
  where id = p_subscription_id;

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, v_learner_id, 'subscription_revoked', jsonb_build_object('subscriptionId', p_subscription_id), null);

  return jsonb_build_object('id', p_subscription_id, 'status', 'canceled');
end;
$$;

revoke all on function public.admin_list_billing_plans() from public, anon, authenticated;
revoke all on function public.admin_list_subscriptions(text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_grant_subscription(text, text) from public, anon, authenticated;
revoke all on function public.admin_revoke_subscription(bigint) from public, anon, authenticated;
grant execute on function public.admin_list_billing_plans() to authenticated;
grant execute on function public.admin_list_subscriptions(text, integer, integer) to authenticated;
grant execute on function public.admin_grant_subscription(text, text) to authenticated;
grant execute on function public.admin_revoke_subscription(bigint) to authenticated;

commit;
