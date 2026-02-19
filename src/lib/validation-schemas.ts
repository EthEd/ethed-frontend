import { z } from 'zod';
import { ENS_ROOT_DOMAIN } from './contracts';

/**
 * Ethereum address validation schema
 * Accepts 0x-prefixed 40-character hex string
 */
export const ethereumAddressSchema = z
  .string()
  .transform((val) =>
    val
      .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, '')
      .replace(/[\u2018\u2019\u201C\u201D]/g, '')
      .replace(/[\s\u00A0]+/g, '')
      .trim()
      .toLowerCase()
  )
  .refine(
    (val) => /^0x[a-f0-9]{40}$/.test(val),
    { message: 'Invalid Ethereum address. Expected a 42-character hex string starting with 0x.' }
  );

/**
 * ENS subdomain validation schema
 * Allows alphanumeric characters and hyphens, 3-32 chars
 */
export const ensSubdomainSchema = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(32, 'Subdomain must be at most 32 characters')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/,
    'Subdomain must start and end with alphanumeric characters and contain only letters, numbers, and hyphens'
  )
  .transform((val) => val.toLowerCase());

/**
 * ENS full name schema for names like "alice.ayushetty.eth"
 */
export const ensFullNameSchema = z
  .string()
  .min(1)
  .transform((val) => val.toLowerCase().trim());

/**
 * Schema for ENS registration request
 */
export const ensRegistrationSchema = z.object({
  subdomain: z.string().min(1, 'Subdomain is required'),
  walletAddress: ethereumAddressSchema.optional(),
  rootDomain: z.enum(['ayushetty.eth', 'ayushetty.eth']).optional().default(ENS_ROOT_DOMAIN as any),
});

/**
 * Schema for wallet connection request
 */
export const walletConnectionSchema = z.object({
  address: ethereumAddressSchema,
  chainId: z.number().int().positive().default(1),
  ensName: z.string().nullable().optional(),
  ensAvatar: z.string().url().nullable().optional(),
});

/**
 * Schema for NFT minting request
 */
export const nftMintSchema = z.object({
  walletAddress: ethereumAddressSchema,
});

/**
 * Schema for user profile update
 */
export const userProfileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .optional(),
  displayName: z
    .string()
    .min(1, 'Display name cannot be empty')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

/**
 * Schema for lesson progress update
 */
export const lessonProgressSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
  courseId: z.string().min(1, 'Course ID is required'),
  completed: z.boolean().default(true),
  score: z.number().min(0).max(100).optional(),
  timeSpent: z.number().int().min(0).optional(), // seconds
});

/**
 * Schema for AI agent chat request
 */
export const agentChatSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message must be at most 4000 characters'),
  context: z
    .object({
      courseId: z.string().optional(),
      lessonId: z.string().optional(),
      topic: z.string().optional(),
    })
    .optional(),
});

/**
 * Pagination schema for list endpoints
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Helper to safely parse and return validation errors
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Zod v4 uses result.error.issues instead of result.error.errors
    const firstError = result.error.issues?.[0];
    return {
      success: false,
      error: firstError?.message || 'Validation failed',
    };
  }
  return { success: true, data: result.data };
}
