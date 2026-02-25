/**
 * Environment Variable Audit Script
 *
 * Checks that critical environment variables are set for production.
 * Run manually: node scripts/env-audit.mjs
 * Also runs weekly via GitHub Actions (.github/workflows/backup.yml).
 */

const REQUIRED_VARS = [
  { name: "DATABASE_URL", critical: true, description: "PostgreSQL connection string" },
  { name: "NEXTAUTH_SECRET", critical: true, description: "JWT signing secret" },
];

const RECOMMENDED_VARS = [
  { name: "AMOY_RPC_URL", critical: false, description: "Polygon Amoy RPC for on-chain operations" },
  { name: "DEPLOYER_PRIVATE_KEY", critical: false, description: "Server relayer wallet key" },
  { name: "NFT_CONTRACT_ADDRESS", critical: false, description: "Deployed NFT contract address" },
  { name: "ENS_REGISTRAR_ADDRESS", critical: false, description: "Deployed ENS registrar contract address" },
  { name: "PINATA_JWT", critical: false, description: "Pinata IPFS uploads" },
  { name: "OPENAI_API_KEY", critical: false, description: "AI agent backend" },
  { name: "GOOGLE_CLIENT_ID", critical: false, description: "Google OAuth" },
  { name: "GITHUB_CLIENT_ID", critical: false, description: "GitHub OAuth" },
];

const isProduction = process.env.NODE_ENV === "production";

let exitCode = 0;
const missing = [];
const warnings = [];

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║           eth.ed Environment Variable Audit         ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log(`  Environment: ${process.env.NODE_ENV || "not set"}`);
console.log("");

// Check required variables
console.log("── Required Variables ──────────────────────────────────");
for (const v of REQUIRED_VARS) {
  const value = process.env[v.name];
  if (!value) {
    console.log(`  ❌ ${v.name} — MISSING (${v.description})`);
    missing.push(v.name);
    if (isProduction && v.critical) exitCode = 1;
  } else {
    console.log(`  ✅ ${v.name} — set`);
  }
}

console.log("");
console.log("── Recommended Variables ───────────────────────────────");
for (const v of RECOMMENDED_VARS) {
  const value = process.env[v.name];
  if (!value) {
    console.log(`  ⚠️  ${v.name} — not set (${v.description})`);
    warnings.push(v.name);
  } else {
    // Mask the value
    const masked = value.slice(0, 4) + "..." + value.slice(-4);
    console.log(`  ✅ ${v.name} — set (${masked})`);
  }
}

// Security checks
console.log("");
console.log("── Security Checks ────────────────────────────────────");

// We can't easily check files from this script, so just note the guidance
console.log("  ℹ️  Ensure no secrets are committed to version control");
console.log("  ℹ️  Use .env.local (gitignored) or a secrets manager");

if (process.env.DEPLOYER_PRIVATE_KEY) {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key.startsWith("0x")) {
    console.log("  ⚠️  DEPLOYER_PRIVATE_KEY should start with 0x prefix");
  }
  if (key.length < 66) {
    console.log("  ⚠️  DEPLOYER_PRIVATE_KEY appears too short");
  }
}

console.log("");
console.log("── Summary ────────────────────────────────────────────");
if (missing.length > 0) {
  console.log(`  Missing required: ${missing.join(", ")}`);
}
if (warnings.length > 0) {
  console.log(`  Missing recommended: ${warnings.join(", ")}`);
}
if (missing.length === 0 && warnings.length === 0) {
  console.log("  All variables configured! ✅");
}

console.log("");
process.exit(exitCode);
