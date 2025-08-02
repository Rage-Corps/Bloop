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

  sources: z
    .array(z.object({
      id: z.string(),
      sourceName: z.string(),
      url: z.string().url(),
    }))
    .optional()
    .default([])
    .transform((sources) => sources || []),

  createdAt: z
    .string()
    .datetime()
    .optional(),

  updatedAt: z
    .string()
    .datetime()
    .optional(),
});

// Schema for creating media (all fields required except auto-generated ones)
export const CreateMediaSchema = MediaSchema.omit({ 
  createdAt: true, 
  updatedAt: true,
  sources: true 
});

// Schema for updating media (all fields optional except id is omitted)
export const UpdateMediaSchema = MediaSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  sources: true 
});

// Schema for query parameters
export const MediaQuerySchema = z.object({
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseInt(val);
      return val;
    }),
  offset: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseInt(val);
      return val;
    }),
  source: z
    .string()
    .optional(),
});

// Schema for route parameters
export const MediaParamsSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});

// API Response schemas
export const MediaListResponseSchema = z.object({
  data: z.array(MediaSchema),
  total: z.number(),
  filtered: z.number(),
});

// Type exports
export type Media = z.infer<typeof MediaSchema>;
export type CreateMedia = z.infer<typeof CreateMediaSchema>;
export type UpdateMedia = z.infer<typeof UpdateMediaSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
export type MediaParams = z.infer<typeof MediaParamsSchema>;
export type MediaListResponse = z.infer<typeof MediaListResponseSchema>;

// Extended media type with computed properties for frontend
export interface MediaWithMetadata extends Media {
  sourceCount: number;
  categoryCount: number;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}