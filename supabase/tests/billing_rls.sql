begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'billing-super-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'billing-finance-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000603', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'billing-support-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000604', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'billing-learner-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000601', 'super_admin'),
  ('00000000-0000-4000-8000-000000000602', 'finance'),
  ('00000000-0000-4000-8000-000000000603', 'support_agent');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000603';
do $$
begin
  begin
    perform public.admin_list_billing_plans();
    raise exception 'a role without the billing permission can list plans';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_list_subscriptions(null, 0, 20);
    raise exception 'a role without the billing permission can list subscriptions';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_grant_subscription('billing-learner-test@example.test', 'pro_monthly');
    raise exception 'a role without the billing permission can grant a subscription';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000602';
do $$
declare
  v_subscription_id bigint;
begin
  if jsonb_array_length(public.admin_list_billing_plans()) <> 2 then
    raise exception 'the seeded placeholder plans are missing';
  end if;

  begin
    perform public.admin_grant_subscription('billing-learner-test@example.test', 'not_a_real_plan');
    raise exception 'an unknown plan id was accepted';
  exception when others then
    if sqlerrm <> 'invalid_plan' then raise; end if;
  end;

  begin
    perform public.admin_grant_subscription('nobody@example.test', 'pro_monthly');
    raise exception 'granting to an unknown email succeeded';
  exception when others then
    if sqlerrm <> 'learner_account_not_found' then raise; end if;
  end;

  v_subscription_id := (public.admin_grant_subscription('billing-learner-test@example.test', 'pro_monthly') ->> 'id')::bigint;
  if (public.admin_list_subscriptions(null, 0, 20) ->> 'total')::integer <> 1 then
    raise exception 'the granted subscription is missing from the list';
  end if;

  -- Granting a second plan to the same learner updates the existing active
  -- row instead of creating a duplicate (enforced by the partial unique index).
  if (public.admin_grant_subscription('billing-learner-test@example.test', 'pro_annual') ->> 'id')::bigint <> v_subscription_id then
    raise exception 'granting a new plan created a second subscription instead of updating the existing one';
  end if;
  if (public.admin_list_subscriptions(null, 0, 20) ->> 'total')::integer <> 1 then
    raise exception 'switching plans created a duplicate active subscription';
  end if;

  begin
    perform public.admin_revoke_subscription(999999);
    raise exception 'revoking a nonexistent subscription succeeded';
  exception when others then
    if sqlerrm <> 'subscription_not_found' then raise; end if;
  end;

  if (public.admin_revoke_subscription(v_subscription_id) ->> 'status') <> 'canceled' then
    raise exception 'revoking the subscription was not applied';
  end if;
  if (public.admin_list_subscriptions('active', 0, 20) ->> 'total')::integer <> 0 then
    raise exception 'a revoked subscription still counts as active';
  end if;
  if (public.admin_list_subscriptions('canceled', 0, 20) ->> 'total')::integer <> 1 then
    raise exception 'the revoked subscription is missing from the canceled list';
  end if;

  -- Revoking freed the unique active-subscription slot, so granting again succeeds.
  perform public.admin_grant_subscription('billing-learner-test@example.test', 'pro_monthly');
  if (public.admin_list_subscriptions('active', 0, 20) ->> 'total')::integer <> 1 then
    raise exception 'granting after a revoke did not create a new active subscription';
  end if;
end $$;

reset role;
do $$
begin
  if (select count(*) from public.admin_audit_events where action = 'subscription_granted') <> 3 then
    raise exception 'subscription grants did not create the expected audit events';
  end if;
  if (select count(*) from public.admin_audit_events where action = 'subscription_revoked') <> 1 then
    raise exception 'subscription revocation did not create an audit event';
  end if;
end $$;

reset role;
set local role anon;
set local request.jwt.claim.sub = '';
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin_%'
      and pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
  ) then
    raise exception 'anonymous role can execute an admin RPC';
  end if;
  begin
    perform count(*) from public.billing_plans;
    raise exception 'anonymous role can directly read billing plans';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.subscriptions;
    raise exception 'anonymous role can directly read subscriptions';
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;
