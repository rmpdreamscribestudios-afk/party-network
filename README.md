# Party Network

Party Network is a production-ready MVP for a mobile-first interactive event experience built with Next.js 15, TypeScript, Tailwind CSS, and the App Router.

Guests scan a QR code, join the event, receive a luck score, and enter a shared live raffle experience backed by Supabase.

## Routes

- `/` - guest landing page
- `/join` - guest registration
- `/confirmation` - registration success and luck score
- `/success` - compatibility redirect-style screen for older links
- `/host` - host dashboard
- `/live` - projector-friendly live display
- `/raffle` - dramatic raffle draw
- `/prize` - regular prize reveal
- `/grand-prize` - final grand prize reveal
- `/message` - host message screen

Guest registrations are stored in Supabase so every phone sees the same event list. Raffle reveal state still uses browser event state for the host flow.

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
  guest_name text not null,
  funny_answer text,
  luck_score integer not null check (luck_score between 1 and 100),
  created_at timestamptz not null default now()
);
```

4. Enable Realtime for the `guests` table in Supabase under **Database > Replication**.
5. In **Project Settings > API**, copy the project URL and anon public key.
6. Add these environment variables in Vercel under **Settings > Environment Variables**:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

7. Redeploy the Vercel project.

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
