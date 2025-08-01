import { z } from 'zod';

// Base media schema
export const MediaSchema = z.object({
  id: z
    .string()
    .min(1, 'id is required')
    .max(100, 'id must be less than 100 characters'),

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

  thumbnailUrl: z
    .string()
    .url('thumbnailUrl must be a valid URL')
    .max(500, 'thumbnailUrl must be less than 500 characters'),

  pageUrl: z
    .string()
    .url('pageUrl must be a valid URL')
    .max(500, 'pageUrl must be less than 500 characters'),

  categories: z
    .array(z.string().min(1).max(50))
    .optional()
    .default([])
    .transform((categories) => categories || []),
});

// Schema for creating media (all fields required)
export const CreateMediaSchema = MediaSchema;

// Schema for updating media (all fields optional except id is omitted)
export const UpdateMediaSchema = MediaSchema.partial().omit({ id: true });

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
