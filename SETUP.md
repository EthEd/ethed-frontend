# EthEd Setup Guide

## Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Required environment variables:**

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `DATABASE_URL` | Yes | PostgreSQL connection string |
   | `NEXTAUTH_SECRET` | Yes (prod) | Secure random string for JWT signing |
   | `NEXTAUTH_URL` | Yes | Your domain (http://localhost:3001 for dev) |

3. **Blockchain / On-chain (Polygon Amoy testnet):**

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AMOY_RPC_URL` | For on-chain | JSON-RPC URL (e.g. `https://rpc-amoy.polygon.technology`) |
   | `DEPLOYER_PRIVATE_KEY` | For on-chain | Hex private key of the server relayer wallet (with `0x` prefix) |
   | `NFT_CONTRACT_ADDRESS` | Optional | Override deployed NFT contract address |
   | `ENS_REGISTRAR_ADDRESS` | Optional | Override deployed ENS registrar address |

   > **⚠️ Security**: Never commit private keys to version control. Use a `.env.local` file (gitignored) or a secrets manager (Vercel Environment Variables, AWS Secrets Manager, HashiCorp Vault).

4. **IPFS / Pinata:**

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `PINATA_JWT` | For IPFS | Pinata SDK JWT token |
   | `PINATA_GATEWAY_URL` | Optional | Custom Pinata gateway URL |

   In development without `PINATA_JWT`, the app falls back to local files under `public/local-metadata/`.

5. **AI Agent:**

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `OPENAI_API_KEY` | Optional | OpenAI API key for AI-powered learning assistant |
   | `OPENAI_BASE_URL` | Optional | Custom OpenAI-compatible API base URL |
   | `OPENAI_MODEL` | Optional | Model name (default: `gpt-3.5-turbo`) |

   Without `OPENAI_API_KEY`, the agent returns helpful mock responses.

6. **OAuth Providers (optional):**
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google sign-in
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` for GitHub sign-in
   - Email server settings (`EMAIL_HOST`, `EMAIL_PORT`, etc.) for magic link auth

## Secret Management Best Practices

- **Never commit secrets** to git. All sensitive values belong in `.env.local` (gitignored).
- **Vercel deployments**: Add env vars in the Vercel Dashboard → Project Settings → Environment Variables.
- **Local development**: Use `.env.local` for secrets. The demo credentials provider is automatically disabled in production.
- **Key rotation**: Rotate `DEPLOYER_PRIVATE_KEY` and `NEXTAUTH_SECRET` periodically. Update Vercel env vars and redeploy.
- **Deployer wallet security**: The `DEPLOYER_PRIVATE_KEY` controls a server-side relayer wallet used to mint NFTs and register ENS names on behalf of users. Keep its balance low (only enough MATIC for gas). Consider using a hardware wallet or KMS for mainnet deployments.

## Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create a database** named `ethed`
3. **Update DATABASE_URL** in `.env.local`
4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

## Deploying Smart Contracts

To deploy the NFT and ENS contracts to Polygon Amoy testnet:

```bash
# Set env vars
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
export DEPLOYER_PRIVATE_KEY="0x..."

# Deploy contracts
pnpm deploy:amoy

# Pin genesis NFT assets to IPFS
export PINATA_JWT="..."
pnpm pin:genesis

# Run smoke test
node scripts/smoke-amoy.mjs
```

After deployment, update `NFT_CONTRACT_ADDRESS` and `ENS_REGISTRAR_ADDRESS` in your `.env.local`.

---

## Staging checklist (short)
See `docs/STAGING_CHECKLIST.md` for a full staging deploy checklist: required env vars, CI flags, pre-deploy and post-deploy verification steps.

## Production release checklist (short)
See `docs/RELEASE_CHECKLIST.md` for the production launch & rollback checklist.

## Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

3. **Access the application:**
   - Open http://localhost:3001
   - Use SIWE (Sign In With Ethereum) to authenticate with your wallet

### Vercel / CI troubleshooting

If `pnpm install` or the Vercel build fails with registry errors such as `ERR_INVALID_THIS` or `Value of "this" must be of type URLSearchParams`, this is usually an environment mismatch (Node / pnpm) or transient registry problem. Recommended fixes:

- Ensure Vercel is using Node 18+ (set **Node Version** to 18.x or 20.x in Project Settings).
- Ensure the project uses `pnpm` as the package manager (Vercel detects `packageManager` in package.json).
- Clear Vercel build cache and redeploy (Dashboard → Redeploy → Clear cache).

### Dev: CSP warnings (eval / SES / lockdown-install)

- If you see a DevTools console warning about `unsafe-eval` or `lockdown-install.js`, it is most often caused by a browser extension injecting SES/lockdown scripts (not the app itself).
- Open an Incognito window with extensions disabled — if the warning disappears, it was an extension.
- Do NOT enable `unsafe-eval` in production.

## Authentication

The app uses SIWE (Sign In With Ethereum) for wallet-based authentication. You can also optionally configure:
1. OAuth providers (Google, GitHub) via environment variables
2. Email authentication if needed
3. Use a strong, unique `NEXTAUTH_SECRET` in production

## Troubleshooting

- **NextAuth CLIENT_FETCH_ERROR**: Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- **Database connection errors**: Check your `DATABASE_URL` format
- **OAuth errors**: Verify OAuth provider credentials and callback URLs
- **On-chain operations fail**: Check `AMOY_RPC_URL` and `DEPLOYER_PRIVATE_KEY` are set, and the relayer wallet has enough MATIC for gas
- **IPFS uploads fail**: Ensure `PINATA_JWT` is set for production