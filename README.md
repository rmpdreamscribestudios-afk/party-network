# Party Network

Party Network is a production-ready MVP for a mobile-first interactive event experience built with Next.js 15, TypeScript, Tailwind CSS, and the App Router.

Guests scan a QR code, join the event, receive a luck score, and enter a local live raffle experience. The MVP stores guests in `localStorage` only. It does not use Supabase or authentication yet.

## Routes

- `/` - guest landing page
- `/join` - guest registration
- `/success` - access granted and luck score
- `/host` - host dashboard
- `/live` - projector-friendly live display
- `/raffle` - dramatic raffle draw
- `/prize` - regular prize reveal
- `/grand-prize` - final grand prize reveal
- `/message` - host message screen

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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
6. Deploy.

No environment variables are required for this MVP.
