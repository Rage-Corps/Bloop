import { z } from 'zod';
// Base source schema
export const SourceSchema = z.object({
    id: z
        .string()
        .min(1, 'id is required')
        .max(100, 'id must be less than 100 characters'),
    mediaId: z
        .string()
        .min(1, 'mediaId is required')
        .max(100, 'mediaId must be less than 100 characters'),
    sourceName: z
        .string()
        .min(1, 'sourceName is required')
        .max(200, 'sourceName must be less than 200 characters')
        .trim(),
    url: z
        .string()
        .url('url must be a valid URL')
        .max(500, 'url must be less than 500 characters'),
    createdAt: z
        .string()
        .datetime()
        .optional(),
    updatedAt: z
        .string()
        .datetime()
        .optional(),
});
// Schema for creating source (all fields required except auto-generated ones)
export const CreateSourceSchema = SourceSchema.omit({
    createdAt: true,
    updatedAt: true
});
// Schema for updating source (all fields optional except id is omitted)
export const UpdateSourceSchema = SourceSchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
// Schema for route parameters
export const SourceParamsSchema = z.object({
    id: z.string().min(1, 'ID parameter is required'),
});
// Schema for media-specific source queries
export const MediaSourceParamsSchema = z.object({
    mediaId: z.string().min(1, 'Media ID parameter is required'),
});
// Bulk operations schema
export const BulkCreateSourcesSchema = z.object({
    sources: z.array(CreateSourceSchema),
});
// API Response schemas
export const SourceListResponseSchema = z.object({
    data: z.array(SourceSchema),
    total: z.number(),
});
