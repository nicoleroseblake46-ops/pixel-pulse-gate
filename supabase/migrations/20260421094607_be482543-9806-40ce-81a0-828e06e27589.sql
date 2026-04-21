
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users can insert their profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- updates feed
create table public.updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'system',
  created_at timestamptz not null default now()
);
alter table public.updates enable row level security;
create policy "Updates viewable by authenticated" on public.updates for select to authenticated using (true);

-- payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','ETH','USDT')),
  amount numeric not null,
  wallet_address text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','failed')),
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create policy "Users view own payments" on public.payments for select to authenticated using (auth.uid() = user_id);
create policy "Users create own payments" on public.payments for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own payments" on public.payments for update to authenticated using (auth.uid() = user_id);

-- seed
insert into public.updates (title, description, category) values
('New Premium Socks5 Pool Released','3,500 fresh residential socks5 added across 47 countries with 99.9% uptime.','socks'),
('Cards Marketplace v2.4 Live','Improved filters, instant balance check, and refund guarantees.','cards'),
('Cyber Monday Sale: 40% OFF','All proxy plans discounted for 72 hours. Use code NEON40.','sales'),
('Tools Update: Checker v6','Faster validation engine, 5x throughput, GPU acceleration.','tools'),
('Server Maintenance Complete','All systems back online with reduced latency.','system');
