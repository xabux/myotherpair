-- ─── MyOtherPair — Supabase schema ───────────────────────────────────────────
-- Run this entire file in the Supabase SQL Editor once for a fresh project.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── admins ───────────────────────────────────────────────────────────────────
-- Add rows here for each admin email: INSERT INTO admins (email) VALUES ('you@example.com');
create table if not exists admins (
  email text primary key
);
-- Admins table: only service role can mutate; authenticated can check membership
create policy "admins: authenticated read" on admins for select using (auth.role() = 'authenticated');
alter table admins enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id                   uuid primary key references auth.users on delete cascade,
  first_name           text,
  last_name            text,
  email                text,
  phone                text,
  date_of_birth        date,
  avatar_url           text,
  street_address       text,
  city                 text,
  state                text,
  postal_code          text,
  country              text,
  left_foot_size       numeric,
  right_foot_size      numeric,
  size_system          text default 'US', -- 'US' | 'UK' | 'EU'
  gender               text,              -- 'mens' | 'womens'
  preferred_brands     text[] default '{}',
  acceptable_conditions text[] default '{}',
  created_at           timestamptz default now()
);

-- ── listings ─────────────────────────────────────────────────────────────────
create table if not exists listings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles on delete cascade,
  brand        text not null,
  model        text not null,
  size         numeric not null,
  size_system  text default 'US',
  foot_side    text not null,  -- 'left' | 'right'
  condition    text not null,
  colorway     text,
  gender       text,
  description  text,
  image_urls   text[] default '{}',
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- ── matches ──────────────────────────────────────────────────────────────────
create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  listing_id_1  uuid references listings on delete cascade,
  listing_id_2  uuid references listings on delete cascade,
  user_id_1     uuid references profiles on delete cascade,
  user_id_2     uuid references profiles on delete cascade,
  status        text default 'pending',  -- 'pending' | 'confirmed' | 'completed'
  created_at    timestamptz default now()
);

-- ── swipes ───────────────────────────────────────────────────────────────────
create table if not exists swipes (
  id          uuid primary key default gen_random_uuid(),
  swiper_id   uuid references profiles on delete cascade,
  listing_id  uuid references listings on delete cascade,
  direction   text not null,  -- 'pass' | 'match' | 'super'
  created_at  timestamptz default now(),
  unique(swiper_id, listing_id)
);

-- ── messages ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid references matches on delete cascade,
  sender_id  uuid references profiles on delete cascade,
  content    text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table profiles  enable row level security;
alter table listings  enable row level security;
alter table matches   enable row level security;
alter table swipes    enable row level security;
alter table messages  enable row level security;

-- profiles: own row only
create policy "profiles: own row read"   on profiles for select using (auth.uid() = id);
create policy "profiles: own row insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles: own row update" on profiles for update using (auth.uid() = id);

-- listings: anyone authenticated reads; only owner mutates
create policy "listings: authenticated read" on listings for select using (auth.role() = 'authenticated');
create policy "listings: owner insert"       on listings for insert with check (auth.uid() = user_id);
create policy "listings: owner update"       on listings for update using (auth.uid() = user_id);
create policy "listings: owner delete"       on listings for delete using (auth.uid() = user_id);

-- matches: only the two matched users
create policy "matches: participants read" on matches for select
  using (auth.uid() = user_id_1 or auth.uid() = user_id_2);
create policy "matches: authenticated insert" on matches for insert
  with check (auth.role() = 'authenticated');

-- swipes: own swipes only
create policy "swipes: own read"   on swipes for select using (auth.uid() = swiper_id);
create policy "swipes: own insert" on swipes for insert with check (auth.uid() = swiper_id);

-- messages: sender and recipient (via match) can read
create policy "messages: participants read" on messages for select
  using (
    exists (
      select 1 from matches m
      where m.id = match_id
        and (m.user_id_1 = auth.uid() or m.user_id_2 = auth.uid())
    )
  );
create policy "messages: sender insert" on messages for insert
  with check (auth.uid() = sender_id);

-- ─── Storage buckets ─────────────────────────────────────────────────────────
-- Run these in the Storage section of the Supabase dashboard, or uncomment:
-- insert into storage.buckets (id, name, public) values ('shoe-images', 'shoe-images', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies (shoe-images)
create policy "shoe-images: authenticated read"
  on storage.objects for select using (bucket_id = 'shoe-images' and auth.role() = 'authenticated');
create policy "shoe-images: owner upload"
  on storage.objects for insert with check (bucket_id = 'shoe-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "shoe-images: owner delete"
  on storage.objects for delete using (bucket_id = 'shoe-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies (avatars)
create policy "avatars: public read"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: owner upload"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars: owner delete"
  on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
