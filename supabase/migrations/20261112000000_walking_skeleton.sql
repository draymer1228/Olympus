-- OLYMPUS walking skeleton: people and captures.
-- Privacy rule (PLT-02): everything is private to its owner unless the owner
-- marks that one item as shared. The rules live here, in the database, so an
-- app bug cannot show one person's private rows to the other.

-- ---------------------------------------------------------------------------
-- Profiles: one row per signed-in person.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per person. Holds only what the other household member may see (a display name).';

alter table public.profiles enable row level security;

create policy "Signed-in people can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "People update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile automatically when a user is added in Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Captures: quick thoughts (DAY-02). Private by default, shareable per item.
-- ---------------------------------------------------------------------------
create type public.visibility as enum ('private', 'shared');

create table public.captures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  topic text check (topic is null or char_length(topic) <= 80),
  source text not null default 'app' check (source in ('app', 'shortcut')),
  visibility public.visibility not null default 'private',
  created_at timestamptz not null default now()
);

comment on table public.captures is
  'Quick captures. A row is visible only to its owner unless visibility = shared.';

create index captures_owner_created_idx
  on public.captures (owner_id, created_at desc);

alter table public.captures enable row level security;

create policy "Read your own captures and shared ones"
  on public.captures for select
  to authenticated
  using ((select auth.uid()) = owner_id or visibility = 'shared');

create policy "Create captures as yourself"
  on public.captures for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Change your own captures"
  on public.captures for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Delete your own captures"
  on public.captures for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
