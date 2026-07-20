-- easRes initial schema: master CV tables + saved tailored resumes.
-- Every table is owned by a single auth.users row and locked down with RLS.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- profiles: 1:1 with auth.users, holds personal info + summary/headline
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  location text,
  headline text,
  summary text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "owner_all" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- education
-- ---------------------------------------------------------------------
create table public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution text,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  gpa text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.education_bullets (
  id uuid primary key default gen_random_uuid(),
  education_id uuid not null references public.education(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- experience
-- ---------------------------------------------------------------------
create table public.experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text,
  role_title text,
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experience_bullets (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experience(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  description text,
  url text,
  tech_stack text[],
  start_date date,
  end_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_bullets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- skills + links (flat, no bullets)
-- ---------------------------------------------------------------------
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'General',
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  url text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- tailored_resumes: point-in-time AI output + mutable toggle state
-- ---------------------------------------------------------------------
create table public.tailored_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  job_title text,
  company_name text,
  job_description text not null,
  ai_model text,
  generated_content jsonb not null,
  toggle_state jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- RLS + updated_at triggers for every remaining table
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'education', 'education_bullets',
    'experience', 'experience_bullets',
    'projects', 'project_bullets',
    'skills', 'links',
    'tailored_resumes'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner_all" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Helpful indexes for the common "fetch everything for user X" queries
-- ---------------------------------------------------------------------
create index education_user_id_idx on public.education (user_id, sort_order);
create index education_bullets_education_id_idx on public.education_bullets (education_id, sort_order);
create index experience_user_id_idx on public.experience (user_id, sort_order);
create index experience_bullets_experience_id_idx on public.experience_bullets (experience_id, sort_order);
create index projects_user_id_idx on public.projects (user_id, sort_order);
create index project_bullets_project_id_idx on public.project_bullets (project_id, sort_order);
create index skills_user_id_idx on public.skills (user_id, sort_order);
create index links_user_id_idx on public.links (user_id, sort_order);
create index tailored_resumes_user_id_idx on public.tailored_resumes (user_id, created_at desc);
