# Incossify (bobby) — full-stack rebuild

Static HTML clone-proof rebuild as a Next.js full-stack app. All state (users,
balances, tasks ledger, withdrawals, sessions) lives **server-side** in Firestore
behind the Firebase Admin SDK. There is no meaningful client-side data to clone.

## Stack
- Next.js 16 (App Router, TypeScript, Turbopack)
- Firebase Admin SDK + Firestore (project `glamour-28049`)
- bcrypt password hashing, httpOnly session cookies
- Admin SDK access only — Firestore rules deny direct client reads/writes

## Local setup
1. `npm install`
2. Create `.env.local` (see `.env.example`) with Firebase service-account
   credentials. Quickest: `FIREBASE_SERVICE_ACCOUNT` = the whole service-account
   JSON on one line.
   Generate: Firebase console → Project settings → Service accounts →
   "Generate new private key".
3. Set the admin password hash:
   `node scripts/hash-password.mjs "yourpassword"` → paste into
   `ADMIN_PASSWORD_HASH` in `.env.local`.
4. `npm run dev`

## Deploy
- Vercel: import the repo. Add the same env vars in Project Settings → Environment
  Variables (FIREBASE_SERVICE_ACCOUNT, ADMIN_PASSWORD_HASH).
- Apply rules: `firebase deploy --only firestore:rules` (rules live in
  `firestore.rules`). Keep it "deny all" — the server uses Admin SDK and bypasses
  rules.

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
