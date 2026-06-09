import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  thumbnail: z.string().url(),
  previewVideo: z.string().url().optional(),
  price: z.number().positive(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.number().int().positive(),
  categoryId: z.string().cuid(),
  isPublished: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const createLessonSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  videoUrl: z.string().url(),
  duration: z.number().int().positive(),
  order: z.number().int().nonnegative(),
});

export const updateLessonSchema = createLessonSchema.partial();
