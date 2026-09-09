begin;

set local role postgres;
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'one@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'two@example.test',
    '',
    now(),
    now(),
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
  true
);

do $$
declare
  affected_rows integer;
  visible_profiles bigint;
begin
  update public.learner_profiles
  set display_name = 'Learner One'
  where id = auth.uid();
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'expected learner one to update exactly one owned profile, updated %', affected_rows;
  end if;

  select count(*) into visible_profiles from public.learner_profiles;
  if visible_profiles <> 1 then
    raise exception 'expected learner one to see one profile, saw %', visible_profiles;
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}',
  true
);

do $$
declare
  affected_rows integer;
  visible_profiles bigint;
begin
  select count(*) into visible_profiles from public.learner_profiles;
  if visible_profiles <> 1 then
    raise exception 'expected learner two to see one profile, saw %', visible_profiles;
  end if;

  update public.learner_profiles
  set display_name = 'Hijacked'
  where id = '11111111-1111-1111-1111-111111111111';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'learner two updated another learner profile';
  end if;
end;
$$;

rollback;
