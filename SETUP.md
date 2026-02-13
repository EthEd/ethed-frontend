# EthEd Setup Guide

## Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update the environment variables:**
   - `NEXTAUTH_SECRET`: Generate a secure secret key
   - `NEXTAUTH_URL`: Set to your domain (http://localhost:3001 for development)
   - `DATABASE_URL`: Your PostgreSQL database connection string

3. **Optional OAuth Providers:**
   - Add Google OAuth credentials for Google sign-in
   - Add GitHub OAuth credentials for GitHub sign-in
   - Add email server settings for magic link authentication

4. **Optional Pinata (IPFS uploads):**
   - `PINATA_JWT`: JWT for Pinata SDK (used by upload flows and `pnpm pin:genesis`) — **required for production NFT pinning**. If you don't provide it during development, the app will fall back to local assets and local metadata files under `public/local-metadata/` for testing.

## Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create a database** named `ethed`
3. **Update DATABASE_URL** in `.env.local`
4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open http://localhost:3001
   - Use the demo login with any email/name for testing

### Dev: CSP warnings (eval / SES / lockdown-install)

- If you see a DevTools console warning about `unsafe-eval` or `lockdown-install.js`, it is most often caused by a browser extension injecting SES/lockdown scripts (not the app itself).
- Quick checks:
  - Open an Incognito window with extensions disabled — if the warning disappears, it was an extension.
  - In DevTools -> Console expand the CSP message to see the **initiator / source**.
- We do **not** relax CSP in development. Instead this project includes a *report-only* CSP in development that forwards violation reports to `/api/csp-report` so we can identify the initiator without weakening security.
- If a CSP report shows `blocked-uri: "eval"` and `source-file` pointing at a `_next/static` chunk, common causes are browser extensions or devtools instrumentation (React/Redux/Performance tools) that inject code or use string evaluation.
  - Quick checks: reproduce in Incognito (extensions off); open DevTools → Sources and search the `source-file` path; temporarily disable React/Redux DevTools.
  - If the report shows a third‑party library from your bundle, open an issue or replace the library—do NOT add `unsafe-eval` to production CSP.
- Do NOT enable `unsafe-eval` in production — instead remove the offending library or sandbox it.


## Authentication

The app includes a demo credentials provider for testing. In production, you should:
1. Remove the demo provider
2. Configure proper OAuth providers (Google, GitHub)
3. Set up email authentication if needed
4. Use a secure NEXTAUTH_SECRET

## Troubleshooting

- **NextAuth CLIENT_FETCH_ERROR**: Ensure NEXTAUTH_SECRET is set in .env.local
- **Database connection errors**: Check your DATABASE_URL format
- **OAuth errors**: Verify your OAuth provider credentials and callback URLs