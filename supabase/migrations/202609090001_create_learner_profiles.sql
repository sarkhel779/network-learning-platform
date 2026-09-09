create type public.learning_level as enum (
  'beginner',
  'graduate',
  'it_experienced',
  'networking_professional',
  'career_switcher'
);

create table public.learner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text,
  learning_level public.learning_level,
  career_objective text check (char_length(career_objective) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;

create policy "learners read own profile"
on public.learner_profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "learners update own profile"
on public.learner_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.learner_profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(new.raw_user_meta_data ->> 'full_name', 80),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger learner_profiles_set_updated_at
before update on public.learner_profiles
for each row execute procedure public.set_updated_at();

grant select, update on public.learner_profiles to authenticated;
