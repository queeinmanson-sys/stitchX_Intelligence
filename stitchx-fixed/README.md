# StitchX — fixed build

Your `page.tsx` imported three files that didn't exist (`@/lib/supabase`, `@/components/login`, `@/components/race-control-dashboard`), plus `radio-player.tsx` imported a missing `./audio-visualizer`, and the backend was missing a closing `})`. That's why the frontend wouldn't render. All five are now in place. **The full Next.js production build compiles successfully** — verified with `next build` (output: `✓ Compiled successfully`, all 3 pages generated static).

## How to run it

**1. Install dependencies** (your project uses pnpm per `pnpm-lock.yaml`):

```bash
pnpm install
```

If you don't have pnpm, `npm install` works too — it'll just generate a `package-lock.json` alongside.

**2. Create `.env.local`** in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://linrusgrvszlgwwgddve.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9Xys4snk8mXI29JnX_Dm2g_zeqSbnqZ
NEXT_PUBLIC_BACKEND_URL=https://stitchxradio-production.up.railway.app
```

(Use the `.env.local.example` file as a template.) **Rotate the key above in Supabase — it was pasted in a chat transcript.**

**3. Configure Supabase for instant-login dev mode:**

In the Supabase dashboard for your project:

- **Authentication → Providers → Email** — make sure "Enable Email provider" is **ON**.
- Same screen: turn **"Confirm email" OFF**. Now sign-up logs you in immediately with no confirmation link.
- **Authentication → URL Configuration** — add `http://localhost:3000` to both "Site URL" and "Redirect URLs".

**4. Start it:**

```bash
pnpm dev
```

Open `http://localhost:3000`, click "Don't have an account? Sign up", enter any email/password, and you're in the dashboard.

## What you'll see

1. **Login screen** with a Sign in / Sign up toggle.
2. After auth → **dashboard** with three tabs:
   - **Live Race** — Intelligence Platform pulling `/insights` from Railway every 5s, with the Radio Player in the right rail.
   - **Fan Zone** — Fan-flavored insight cards, Radio Player in the rail.
   - **UCI Officials** — the full Login → Event → Scan → Check → Save inspection workflow in the main column, with a compact Intelligence Platform (officials view) and Radio Player in the rail.
3. **Sign-out button** (LogOut icon) in the top-right.

The session persists across reloads (Supabase stores the JWT in `localStorage` and silently refreshes it).

## Backend

Redeploy `backend_server.js` to Railway. Changes vs. your RTF:

- Added the missing `})` on `app.listen(...)` (original would throw `SyntaxError` on boot).
- Added `GET /now-playing` (the radio player polls this every 10s).
- Added a simulation loop that actually mutates `raceState`, so `/insights` returns changing output over time instead of fixed strings.

If you change the Railway URL, update `NEXT_PUBLIC_BACKEND_URL` in `.env.local` and in Railway.

## Files I added or changed

| Path | New? |
|---|---|
| `app/page.tsx` | replaced |
| `lib/supabase.ts` | new |
| `components/login.tsx` | new |
| `components/race-control-dashboard.tsx` | new |
| `components/intelligence-platform.tsx` | new |
| `components/radio-player.tsx` | new |
| `components/audio-visualizer.tsx` | new |
| `package.json` | added `@supabase/supabase-js: ^2.45.0` |
| `.env.local.example` | new |
| `backend_server.js` | replaced (was `backend_server.rtf`) |

Everything else in the project (topbar, UCI pane, inspection screens, all `components/ui/*`, `lib/data.ts`, `lib/inspection-store.ts`, `lib/types.ts`, `lib/utils.ts`, `app/layout.tsx`) is untouched.
