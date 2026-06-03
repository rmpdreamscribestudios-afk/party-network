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
  funny_answer text,
  luck_score integer not null check (luck_score between 1 and 100),
  created_at timestamptz not null default now()
);
```

4. Create the `event_settings` table:

```sql
create table public.event_settings (
  id text primary key,
  event_title text not null,
  event_subtitle text,
  event_date date,
  updated_at timestamptz not null default now()
);
```

5. Add the default event settings row:

```sql
insert into public.event_settings (
  id,
  event_title,
  event_subtitle,
  event_date
) values (
  'current',
  'Party Network',
  'Helping people connect, participate, and create meaningful memories together.',
  null
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
      'Kindness'
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

8. Seed starter missions:

```sql
insert into public.missions (prompt, category, is_template) values
  ('Meet someone from another table and learn what brought them here.', 'Icebreaker', true),
  ('Find a guest you have not spoken to yet and trade favorite snacks.', 'Friendship', true),
  ('Ask someone for a family tradition they actually enjoy.', 'Family', true),
  ('Form a tiny team of three and create a shared celebration chant.', 'Team Building', true),
  ('Introduce two guests who should know each other.', 'Community', true),
  ('Give someone a specific, genuine compliment.', 'Kindness', true);
```

9. Enable Realtime for the `missions`, `mission_rounds`, and `guest_missions` tables in Supabase under **Database > Replication**.
10. In **Project Settings > API**, copy the project URL and anon public key.
11. Add these environment variables in Vercel under **Settings > Environment Variables**:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

12. Redeploy the Vercel project.

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
