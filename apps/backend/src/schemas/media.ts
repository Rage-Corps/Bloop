import { z } from 'zod';

// Base media schema
export const MediaSchema = z.object({
  uniqueId: z
    .string()
    .min(1, 'uniqueId is required')
    .max(100, 'uniqueId must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'uniqueId can only contain letters, numbers, underscores, and hyphens'
    ),

  name: z
    .string()
    .min(1, 'name is required')
    .max(200, 'name must be less than 200 characters')
    .trim(),

  description: z
    .string()
    .min(1, 'description is required')
    .max(1000, 'description must be less than 1000 characters')
    .trim(),

  url: z
    .string()
    .url('url must be a valid URL')
    .max(500, 'url must be less than 500 characters'),

  source: z
    .string()
    .min(1, 'source is required')
    .max(100, 'source must be less than 100 characters')
    .trim(),

  thumbnail: z
    .string()
    .url('thumbnail must be a valid URL')
    .max(500, 'thumbnail must be less than 500 characters'),
});

// Schema for creating media (all fields required)
export const CreateMediaSchema = MediaSchema;

// Schema for updating media (all fields optional except uniqueId is omitted)
export const UpdateMediaSchema = MediaSchema.partial().omit({ uniqueId: true });

// Schema for query parameters
export const MediaQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  source: z.string().optional(),
});

// Schema for route parameters
export const MediaParamsSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});

// Type exports
export type Media = z.infer<typeof MediaSchema>;
export type CreateMedia = z.infer<typeof CreateMediaSchema>;
export type UpdateMedia = z.infer<typeof UpdateMediaSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
export type MediaParams = z.infer<typeof MediaParamsSchema>;
