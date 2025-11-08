
-- 🔮 Supabase schema for Free Spirit Tarot
create table if not exists readers (
  id bigint generated always as identity primary key,
  name text,
  alias text unique,
  emoji text,
  model text,
  temperature float default 0.8,
  system_instructions text,
  popular_spreads text,
  created_at timestamp with time zone default now()
);

create table if not exists readings (
  id bigint generated always as identity primary key,
  reader_alias text references readers(alias) on delete cascade,
  user_id text,
  question text,
  created_at timestamp with time zone default now()
);

create table if not exists reader_sessions (
  id bigint generated always as identity primary key,
  reader_alias text references readers(alias) on delete cascade,
  user_id text,
  started_at timestamp with time zone default now(),
  last_reading_at timestamp with time zone,
  reading_count int default 0
);

create or replace function increment_reader_meta(reader_alias_param text, user_id_param text)
returns void as $$
begin
  update readers
  set temperature = temperature -- just a stub for example, add custom counters here
  where alias = reader_alias_param;
end;
$$ language plpgsql;
