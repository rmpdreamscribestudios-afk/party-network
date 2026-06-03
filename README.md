# Party Network

Party Network is a production-ready MVP for a mobile-first Shared Experiences Platform built with Next.js 15, TypeScript, Tailwind CSS, and the App Router.

Guests scan a QR code, join the event, receive a luck score, take part in shared participation moments, and help create meaningful memories together.

## Routes

- `/` - guest landing page
- `/join` - guest registration
- `/confirmation` - registration success and luck score
- `/mission` - guest mission card and completion action
- `/success` - compatibility redirect-style screen for older links
- `/host` - host dashboard
- `/live` - projector-friendly live display
- `/raffle` - dramatic live draw
- `/prize` - regular prize reveal
- `/grand-prize` - final grand prize reveal
- `/message` - host message screen

Guest registrations, event settings, missions, mission rounds, and mission assignments are stored in Supabase so every phone sees the same event list, event title, active mission round, timer, and completion stats. Reveal state still uses browser event state for the host flow.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create a `.env.local` file for local testing:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If these variables are missing, the app shows: `Supabase is not configured yet.`

## Supabase Setup

1. Create a Supabase project at `https://supabase.com`.
2. Open the SQL editor for the project.
3. Create the `guests` table:

```sql
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  first_name text,
  interests text,
  favorite_hobby text,
  fun_fact text,
  funny_answer text,
  luck_score integer not null check (luck_score between 1 and 100),
  created_at timestamptz not null default now()
);
```

For an existing `guests` table, add the optional profile columns:

```sql
alter table public.guests
  add column if not exists first_name text,
  add column if not exists interests text,
  add column if not exists favorite_hobby text,
  add column if not exists fun_fact text;
```

4. Create the `event_settings` table:

```sql
create table public.event_settings (
  id text primary key,
  event_title text not null,
  event_subtitle text,
  event_date date,
  event_type text not null default 'Birthday',
  updated_at timestamptz not null default now()
);
```

5. Add the default event settings row:

```sql
insert into public.event_settings (
  id,
  event_title,
  event_subtitle,
  event_date,
  event_type
) values (
  'current',
  'Party Network',
  'Helping people connect, participate, and create meaningful memories together.',
  null,
  'Birthday'
);
```

6. Enable Realtime for the `guests` and `event_settings` tables in Supabase under **Database > Replication**.
7. Create the mission engine tables:

```sql
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null check (char_length(trim(prompt)) > 0),
  category text not null default 'Icebreaker' check (
    category in (
      'Icebreaker',
      'Friendship',
      'Family',
      'Team Building',
      'Community',
      'Kindness',
      'Meet Someone New',
      'Shared Interests',
      'Story Exchange',
      'Kindness Challenge',
      'Community Builder',
      'Team Connector'
    )
  ),
  is_active boolean not null default true,
  is_template boolean not null default false,
  updated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mission_rounds (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes in (5, 10, 15)),
  status text not null default 'active' check (status in ('active', 'completed'))
);

create table public.guest_missions (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  round_id uuid not null references public.mission_rounds(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  photo_proof_url text
);

create index guest_missions_guest_assigned_idx
  on public.guest_missions (guest_id, assigned_at desc);

create index guest_missions_round_idx
  on public.guest_missions (round_id);

create index mission_rounds_active_idx
  on public.mission_rounds (status, started_at desc);
```

8. Create the Connection Engine tracking table:

```sql
create table public.connection_records (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  met_guest_id uuid references public.guests(id) on delete set null,
  person_first_name text,
  mission_id text not null,
  reflection text,
  created_at timestamptz not null default now()
);

create index connection_records_guest_idx
  on public.connection_records (guest_id, created_at desc);

create index connection_records_mission_idx
  on public.connection_records (mission_id);
```

9. Seed starter missions:

```sql
insert into public.missions (prompt, category, is_template) values
  ('Introduce yourself to someone you haven''t met.', 'Meet Someone New', true),
  ('Learn their hometown.', 'Meet Someone New', true),
  ('Find someone who enjoys the same hobby.', 'Shared Interests', true),
  ('Find someone who likes the same food.', 'Shared Interests', true),
  ('Ask someone about a memorable life moment.', 'Story Exchange', true),
  ('Learn one lesson they wish they knew earlier.', 'Story Exchange', true),
  ('Give a genuine compliment.', 'Kindness Challenge', true),
  ('Thank someone for something they do.', 'Kindness Challenge', true),
  ('Introduce two people who don''t know each other.', 'Community Builder', true),
  ('Welcome a newcomer.', 'Community Builder', true),
  ('Meet someone from another department or team.', 'Team Connector', true);
```

10. Enable Realtime for the `missions`, `mission_rounds`, `guest_missions`, and `connection_records` tables in Supabase under **Database > Replication**.
11. In **Project Settings > API**, copy the project URL and anon public key.
12. Add these environment variables in Vercel under **Settings > Environment Variables**:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

13. Redeploy the Vercel project.

## Production Check

```bash
npm run build
```

## Commit To GitHub

```bash
git init
git add .
git commit -m "Build Party Network MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/party-network.git
git push -u origin main
```

If the repository already exists locally, skip `git init` and only run `git add`, `git commit`, and `git push`.

## Deploy To Vercel

1. Push the project to GitHub.
2. Go to Vercel and choose **Add New Project**.
3. Import the `party-network` GitHub repository.
4. Keep the framework preset as **Next.js**.
5. Use the default build command: `npm run build`.
6. Add the Supabase environment variables above.
7. Deploy or redeploy.
