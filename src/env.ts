import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().optional(),
    MONGODB_URI: z.string().optional(),
    OPENPRS_MONGODB_URI: z.string().optional(),
    OPENPRS_DATABASE: z.string().optional(),

    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().url().optional(),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    DOMAIN: z.string().optional(),

    GITHUB_ACCESS_TOKEN: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    RESEND_API_KEY: z.string().optional(),

    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.coerce.number().optional(),
    EMAIL_USERNAME: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),

    WALLETCONNECT_PROJECT_ID: z.string().optional(),

    ARCJET_KEY: z.string().optional(),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    CRON_SECRET: z.string().optional(),

    PINATA_API_KEY: z.string().optional(),
    PINATA_API_SECRET: z.string().optional(),
    PINATA_JWT: z.string().optional(),
    PINATA_GATEWAY_URL: z.string().optional(),

    // Supabase
    SUPABASE_URL: z.string().optional(),
    SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  },
  client: {
    // No payment-related client environment variables needed
  },
  experimental__runtimeEnv: {
    // No payment-related runtime environment variables needed
  },
});
