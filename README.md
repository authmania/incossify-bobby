# Incossify (bobby) — full-stack rebuild

Static HTML clone-proof rebuild as a Next.js full-stack app. All state (users,
balances, task ledger, withdrawals, sessions) lives **server-side** in Firestore.
No business logic or user data is shipped to the browser, so saving the frontend
no longer yields a working clone.

## Stack
- Next.js 16 (App Router, TypeScript, Turbopack)
- Firestore (same `glamour-28049` project the other Incossify/Nextel apps use),
  accessed server-side with the standard web SDK — **no service account needed**
  (it reuses "what princess uses"). The Firestore rules for this project already
  permit these operations.
- bcrypt password hashing + httpOnly session cookies
- Admin SDK-style gating is enforced in the app code (every page re-checks the
  session server-side). Hardening Firestore rules to deny-all client access is
  possible later if the app is moved to a privileged credential (service account).

## Local setup
1. `npm install`
2. `cp .env.example .env.local` and set:
   - `ADMIN_PASSWORD_HASH` — run `node scripts/hash-password.mjs "yourpassword"`
3. `npm run dev`

## Deploy
- Vercel: import the repo, add `ADMIN_PASSWORD_HASH` (+ optional `FIREBASE_*`
  overrides) under Project Settings → Environment Variables.

## Data model (Firestore)
- `account/incossifybobby` — site config (bank details, payment links, social)
- `users/{uid}` — account + wallets (`total/shares/rewards/task`) + daily ledger
- `sessions/{token}` — user session cookies
- `admin_sessions/{token}` — admin session cookies
- `withdrawals/{id}` — withdrawal requests (admin reviews/approves)

## Routes
Public: `/`, `/register`, `/login`, `/admin/login`
Member: `/dashboard`, `/tasks`, `/withdraw`, `/withdraw/receipt`, `/profile`, `/payment`
Admin: `/admin`
