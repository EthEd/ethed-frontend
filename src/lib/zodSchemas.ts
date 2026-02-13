import { z } from "zod";

// URL validation regex
const urlRegex = /^https?:\/\/.+/;

// Slug validation regex - only lowercase letters, numbers, and hyphens
const slugRegex = /^[a-z0-9-]+$/;

export const CourseCreateSchema = z.preprocess((val) => {
  // Accept both client-side keys (`difficulty`, `imageUrl`) and normalize to schema keys (`level`, `fileKey`).
  if (val && typeof val === "object") {
    const copy = { ...(val as any) } as any;
    if (copy.difficulty && !copy.level) copy.level = copy.difficulty;
    if (copy.imageUrl && !copy.fileKey) copy.fileKey = copy.imageUrl;
    return copy;
  }
  return val;
}, z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title must be at most 100 characters long")
    .trim()
    .refine(
      (title) => title.length > 0 && !title.match(/^\s+$/),
      "Title cannot be empty or contain only whitespace"
    ),
    
  description: z
    .string()
    .min(50, "Description must be at least 50 characters long")
    .max(5000, "Description must be at most 5000 characters long")
    .trim()
    .refine(
      (desc) => desc.length > 0 && !desc.match(/^\s+$/),
      "Description cannot be empty or contain only whitespace"
    ),
    
  fileKey: z
    .string()
    .min(1, "Course thumbnail is required")
    .refine(
      (url) => urlRegex.test(url),
      "Please provide a valid image URL"
    ),
    
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(9999, "Price cannot exceed $9,999")
    .refine(
      (price) => Number.isFinite(price),
      "Price must be a valid number"
    ),
    
  duration: z
    .number()
    .min(0.5, "Duration must be at least 0.5 hours")
    .max(500, "Duration cannot exceed 500 hours")
    .refine(
      (duration) => Number.isFinite(duration),
      "Duration must be a valid number"
    ),
    
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    message: "Please select a valid difficulty level"
  }),
  
  category: z
    .string()
    .min(3, "Category must be at least 3 characters long")
    .max(50, "Category must be at most 50 characters long")
    .trim()
    .refine(
      (cat) => cat.length > 0 && !cat.match(/^\s+$/),
      "Category cannot be empty or contain only whitespace"
    ),
    
  smallDescription: z
    .string()
    .min(20, "Short description must be at least 20 characters long")
    .max(200, "Short description must be at most 200 characters long")
    .trim()
    .refine(
      (desc) => desc.length > 0 && !desc.match(/^\s+$/),
      "Short description cannot be empty or contain only whitespace"
    ),
    
  slug: z
    .string()
    .min(3, "URL slug must be at least 3 characters long")
    .max(60, "URL slug must be at most 60 characters long")
    .trim()
    .toLowerCase()
    .refine(
      (slug) => slugRegex.test(slug),
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .refine(
      (slug) => !slug.startsWith("-") && !slug.endsWith("-"),
      "Slug cannot start or end with a hyphen"
    )
    .refine(
      (slug) => !slug.includes("--"),
      "Slug cannot contain consecutive hyphens"
    ),
    
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
    message: "Please select a valid publication status"
  }),
});

// Draft schema with more lenient validation
export const CourseDraftSchema = z.preprocess((val) => {
  if (val && typeof val === "object") {
    const copy = { ...(val as any) } as any;
    if (copy.difficulty && !copy.level) copy.level = copy.difficulty;
    if (copy.imageUrl && !copy.fileKey) copy.fileKey = copy.imageUrl;
    return copy;
  }
  return val;
}, z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100).trim(),
  description: z.string().optional().default(""),
  fileKey: z.string().optional().default(""),
  price: z.number().min(0).max(9999).optional().default(0),
  duration: z.number().min(0).max(500).optional().default(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  category: z.string().optional().default(""),
  smallDescription: z.string().optional().default(""),
  slug: z.string().optional().default(""),
  status: z.literal("DRAFT").default("DRAFT"),
});

export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;
export type CourseDraftInput = z.infer<typeof CourseDraftSchema>;

// Validation helpers
export const validateSlug = (slug: string): boolean => {
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 60;
};

export const sanitizeSlug = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
};