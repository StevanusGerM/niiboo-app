-- =====================================================================
-- NiiBooo — Supabase / PostgreSQL schema
-- Run in Supabase Dashboard > SQL Editor (or `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  username          text unique,
  full_name         text,
  avatar_url        text,
  current_hsk_level smallint not null default 1 check (current_hsk_level between 1 and 6),
  streak_days       integer  not null default 0,
  -- Extension to the base spec: wallet for the expert booking system.
  token_balance     integer  not null default 3 check (token_balance >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- lessons: structured curriculum (content_json = LessonContent)
-- ---------------------------------------------------------------------
create table if not exists public.lessons (
  id           uuid primary key default gen_random_uuid(),
  hsk_level    smallint not null check (hsk_level between 1 and 6),
  title        text not null,
  category     text not null,                     -- e.g. 'greetings', 'food', 'travel'
  content_json jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists lessons_level_idx on public.lessons (hsk_level);

-- ---------------------------------------------------------------------
-- user_progress
-- ---------------------------------------------------------------------
create table if not exists public.user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  is_completed boolean not null default false,
  score        integer check (score between 0 and 100),
  updated_at   timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ---------------------------------------------------------------------
-- parallel_stories (content_pairs = StoryPair[])
-- ---------------------------------------------------------------------
create table if not exists public.parallel_stories (
  id            uuid primary key default gen_random_uuid(),
  title_zh      text not null,
  title_id      text not null,
  hsk_level     smallint not null check (hsk_level between 1 and 6),
  content_pairs jsonb not null default '[]'::jsonb,
  audio_url     text,
  created_at    timestamptz not null default now()
);
create index if not exists stories_level_idx on public.parallel_stories (hsk_level);

-- ---------------------------------------------------------------------
-- hsk_exams (questions_json = ExamQuestion[])
-- ---------------------------------------------------------------------
create table if not exists public.hsk_exams (
  id             uuid primary key default gen_random_uuid(),
  hsk_level      smallint not null check (hsk_level between 1 and 6),
  section_type   text not null check (section_type in ('listening', 'reading', 'writing')),
  questions_json jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists exams_level_idx on public.hsk_exams (hsk_level, section_type);

-- ---------------------------------------------------------------------
-- expert_bookings
-- ---------------------------------------------------------------------
create table if not exists public.expert_bookings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  expert_name    text not null,
  scheduled_time timestamptz not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  zoom_link      text,
  -- Extension to the base spec: tokens paid, used for refunds.
  token_cost     integer not null default 1 check (token_cost >= 1),
  created_at     timestamptz not null default now()
);
create index if not exists bookings_user_idx on public.expert_bookings (user_id, scheduled_time);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.lessons          enable row level security;
alter table public.user_progress    enable row level security;
alter table public.parallel_stories enable row level security;
alter table public.hsk_exams        enable row level security;
alter table public.expert_bookings  enable row level security;

-- Content tables: readable by everyone (anon + authenticated)
drop policy if exists "lessons are public" on public.lessons;
create policy "lessons are public" on public.lessons for select using (true);

drop policy if exists "stories are public" on public.parallel_stories;
create policy "stories are public" on public.parallel_stories for select using (true);

drop policy if exists "exams are public" on public.hsk_exams;
create policy "exams are public" on public.hsk_exams for select using (true);

-- profiles: owner only
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- user_progress: owner only
drop policy if exists "own progress" on public.user_progress;
create policy "own progress" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- expert_bookings: owner can read/insert/cancel; zoom_link & confirmation are set by admins (service role)
drop policy if exists "read own bookings" on public.expert_bookings;
create policy "read own bookings" on public.expert_bookings for select using (auth.uid() = user_id);

drop policy if exists "insert own bookings" on public.expert_bookings;
create policy "insert own bookings" on public.expert_bookings
  for insert with check (auth.uid() = user_id and status = 'pending' and zoom_link is null);

-- =====================================================================
-- Triggers & RPC
-- =====================================================================

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Book a session atomically: deduct tokens + insert booking.
-- Users cannot update token_balance directly in a trusted way, so this runs as definer.
create or replace function public.book_expert_session(
  p_expert_name text,
  p_scheduled_time timestamptz,
  p_cost integer
) returns public.expert_bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking public.expert_bookings;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  -- NOTE: cost comes from the client catalogue (src/data/experts.ts).
  -- For production, move experts into a table and look the rate up here.
  if p_cost < 1 or p_cost > 10 then
    raise exception 'invalid cost';
  end if;
  if p_scheduled_time <= now() then
    raise exception 'slot is in the past';
  end if;

  update public.profiles
     set token_balance = token_balance - p_cost, updated_at = now()
   where id = auth.uid() and token_balance >= p_cost;

  if not found then
    raise exception 'insufficient tokens';
  end if;

  insert into public.expert_bookings (user_id, expert_name, scheduled_time, status, token_cost)
  values (auth.uid(), p_expert_name, p_scheduled_time, 'pending', p_cost)
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Cancel a pending booking and refund tokens
create or replace function public.cancel_expert_session(p_booking_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_cost integer;
begin
  update public.expert_bookings
     set status = 'cancelled'
   where id = p_booking_id and user_id = auth.uid() and status = 'pending'
  returning token_cost into v_cost;
  if not found then
    raise exception 'booking not cancellable';
  end if;
  update public.profiles
     set token_balance = token_balance + v_cost, updated_at = now()
   where id = auth.uid();
end;
$$;

-- Protect token_balance from direct client edits
create or replace function public.protect_token_balance()
returns trigger language plpgsql as $$
begin
  -- Direct client updates run as role "authenticated"; the security-definer
  -- RPCs above run as the function owner and may change the balance.
  if current_user = 'authenticated'
     and new.token_balance is distinct from old.token_balance then
    new.token_balance := old.token_balance;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect_tokens on public.profiles;
create trigger profiles_protect_tokens
  before update on public.profiles
  for each row execute function public.protect_token_balance();
