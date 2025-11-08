
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
