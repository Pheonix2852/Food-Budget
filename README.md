# Food-Budget

...existing project docs...

## Authentication (Clerk)

This project uses Clerk for authentication. Follow the steps below to configure Clerk and the required environment variables.

Required environment variables (add to `.env.local`):

- `CLERK_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- `CLERK_SECRET_KEY` (server secret)
- `CLERK_JWT_KEY` (if you use JWTs)
- `CLERK_WEBHOOK_SECRET` (HMAC secret used to verify Clerk webhooks)
- `ADMIN_EMAIL` (the email address of the initial admin which will be auto-approved)

Example `.env.local`:

```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
ADMIN_EMAIL=admin@example.com
```

Clerk setup notes:

- Enable Google sign-in in your Clerk dashboard (providers) to allow Google OAuth.
- Configure the Clerk webhook URL to point to `https://<your-app>/api/clerk/webhooks` and use the `CLERK_WEBHOOK_SECRET` for verification.

How the flow works in this app:

- When Clerk sends a webhook on user creation / session, the app will attempt to link the Clerk user to an existing `User` row by email.
- If no matching user exists, a `JoinRequest` row is created and the user is redirected to `/pending` after sign-in.
- If a sign-in email matches `ADMIN_EMAIL`, an admin `User` is created and auto-approved.

## Local dev DB note

This repository contains a local SQLite dev DB file in `prisma/dev.db` for convenience. Before deploying to production you should remove this from the repository and use a managed Postgres (set `DATABASE_URL` accordingly).

To remove the committed dev DB from Git but keep a local copy, run:

```bash
git rm --cached prisma/dev.db
git commit -m "remove checked-in dev db"
```

To recreate a local dev SQLite DB for local development:

```bash
npm install
npx prisma migrate dev
```
