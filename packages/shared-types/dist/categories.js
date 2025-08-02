import { z } from 'zod';
// Base category schema
export const CategorySchema = z.object({
    id: z
        .string()
        .min(1, 'id is required')
        .max(100, 'id must be less than 100 characters'),
    name: z
        .string()
        .min(1, 'name is required')
        .max(50, 'name must be less than 50 characters')
        .trim(),
    description: z
        .string()
        .max(200, 'description must be less than 200 characters')
        .optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'color must be a valid hex color')
        .optional(),
    createdAt: z
        .string()
        .datetime()
        .optional(),
    updatedAt: z
        .string()
        .datetime()
        .optional(),
});
// Media-Category junction table schema
export const MediaCategorySchema = z.object({
    mediaId: z.string(),
    categoryId: z.string(),
    createdAt: z
        .string()
        .datetime()
        .optional(),
});
// Schema for creating category
export const CreateCategorySchema = CategorySchema.omit({
    createdAt: true,
    updatedAt: true
});
// Schema for updating category
export const UpdateCategorySchema = CategorySchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
// Schema for route parameters
export const CategoryParamsSchema = z.object({
    id: z.string().min(1, 'ID parameter is required'),
});
// API Response schemas
export const CategoryListResponseSchema = z.object({
    data: z.array(CategorySchema),
    total: z.number(),
});
