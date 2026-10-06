-- Portable Supabase alternative. The deployed demo uses D1, as selected by the user.
-- Private rows have RLS enabled with no anonymous policies. Only safe metrics are public.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.colleges (
 id text primary key, slug text not null unique, name text not null,
 city text not null, state text not null, is_demo boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.registrations (
 id uuid primary key default gen_random_uuid(), name text not null,
 email text not null unique check (email=lower(email)), college_id text not null references public.colleges(id),
 branch text not null, year text not null, idea_text text not null,
 build_card jsonb not null, own_code text not null unique check (own_code ~ '^[A-Z0-9]{6}$'),
 ref_code text, angle text check (angle in ('R','P','F')), is_ambassador boolean not null default false,
 is_demo boolean not null default false,
 readiness jsonb not null default '{"laptop":false,"account":false,"repo":false}'::jsonb,
 consent_at timestamptz not null, created_at timestamptz not null default now()
);
create index registrations_college_created on public.registrations(college_id,created_at);
create index registrations_ref_demo on public.registrations(ref_code,is_demo);
create table public.events (
 id uuid primary key default gen_random_uuid(), type text not null,
 college_id text references public.colleges(id), ref_code text, session_id text not null,
 is_demo boolean not null default false, created_at timestamptz not null default now()
);
create index events_type_college on public.events(type,college_id);
create table public.llm_calls(id uuid primary key default gen_random_uuid(),feature text not null,latency_ms integer not null,fallback_used boolean not null,created_at timestamptz not null default now());
create table public.settings(key text primary key,value text not null);
create table public.rate_limits(key text primary key,count integer not null,expires_at bigint not null);
create table public.ai_cache(key text primary key,value jsonb not null,source text not null,created_at timestamptz not null default now());

-- Aggregate buckets contain no student identifiers, names or emails. Counts are
-- kept separate so security-invoker views never need access to private records.
create table public.college_aggregate_buckets (
 college_id text not null references public.colleges(id), created_at timestamptz not null,
 branch text not null, is_demo boolean not null, amount integer not null default 0,
 primary key(college_id,created_at,branch,is_demo)
);
create table public.referral_aggregate_buckets (
 code text not null,is_demo boolean not null,amount integer not null default 0,
 primary key(code,is_demo)
);
create function private.update_aggregate_buckets() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP in ('UPDATE','DELETE') then
  update public.college_aggregate_buckets set amount=amount-1
   where college_id=old.college_id and created_at=old.created_at and branch=old.branch and is_demo=old.is_demo;
  if old.ref_code is not null then update public.referral_aggregate_buckets set amount=amount-1 where code=old.ref_code and is_demo=old.is_demo; end if;
 end if;
 if TG_OP in ('INSERT','UPDATE') then
  insert into public.college_aggregate_buckets(college_id,created_at,branch,is_demo,amount)
   values(new.college_id,new.created_at,new.branch,new.is_demo,1)
   on conflict(college_id,created_at,branch,is_demo) do update set amount=public.college_aggregate_buckets.amount+1;
  if new.ref_code is not null then
   insert into public.referral_aggregate_buckets(code,is_demo,amount) values(new.ref_code,new.is_demo,1)
    on conflict(code,is_demo) do update set amount=public.referral_aggregate_buckets.amount+1;
  end if;
 end if;
 return coalesce(new,old);
end $$;
revoke all on function private.update_aggregate_buckets() from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.update_aggregate_buckets() to service_role;
create trigger registrations_aggregate after insert or update or delete on public.registrations for each row execute function private.update_aggregate_buckets();

alter table public.colleges enable row level security;
alter table public.registrations enable row level security;
alter table public.events enable row level security;
alter table public.llm_calls enable row level security;
alter table public.settings enable row level security;
alter table public.rate_limits enable row level security;
alter table public.ai_cache enable row level security;
alter table public.college_aggregate_buckets enable row level security;
alter table public.referral_aggregate_buckets enable row level security;

revoke all on public.registrations,public.events,public.llm_calls,public.settings,public.rate_limits,public.ai_cache from anon,authenticated;
create policy colleges_public_read on public.colleges for select to anon,authenticated using(true);
create policy college_metrics_public_read on public.college_aggregate_buckets for select to anon,authenticated using(true);
create policy referral_metrics_public_read on public.referral_aggregate_buckets for select to anon,authenticated using(true);
grant select on public.colleges,public.college_aggregate_buckets,public.referral_aggregate_buckets to anon,authenticated;
grant all on all tables in schema public to service_role;

create view public.college_counts with (security_invoker=true) as
 select c.id,c.slug,c.name,c.city,c.state,b.is_demo,
 coalesce(sum(b.amount),0)::integer as total,
 coalesce(sum(b.amount) filter(where b.created_at >= date_trunc('day',now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'),0)::integer as today,
 coalesce(sum(b.amount) filter(where b.created_at>=now()-interval '24 hours'),0)::integer as rising
 from public.colleges c left join public.college_aggregate_buckets b on b.college_id=c.id group by c.id,b.is_demo;
create view public.college_branch_counts with (security_invoker=true) as
 select college_id,branch,is_demo,sum(amount)::integer as total from public.college_aggregate_buckets group by college_id,branch,is_demo;
create view public.race_board with (security_invoker=true) as
 select id,slug,name,sum(total)::integer as total,sum(today)::integer as today,sum(rising)::integer as rising,
 dense_rank() over(order by sum(total) desc,name) as rank from public.college_counts group by id,slug,name;
create view public.referral_counts with (security_invoker=true) as
 select code,is_demo,sum(amount)::integer as total from public.referral_aggregate_buckets group by code,is_demo;
grant select on public.college_counts,public.college_branch_counts,public.race_board,public.referral_counts to anon,authenticated;
