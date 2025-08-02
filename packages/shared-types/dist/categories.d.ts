import { z } from 'zod';
export declare const CategorySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    id: string;
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export declare const MediaCategorySchema: z.ZodObject<{
    mediaId: z.ZodString;
    categoryId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mediaId: string;
    categoryId: string;
    createdAt?: string | undefined;
}, {
    mediaId: string;
    categoryId: string;
    createdAt?: string | undefined;
}>;
export declare const CreateCategorySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}, {
    id: string;
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}>;
export declare const UpdateCategorySchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}>;
export declare const CategoryParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CategoryListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description?: string | undefined;
        color?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }, {
        id: string;
        name: string;
        description?: string | undefined;
        color?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        description?: string | undefined;
        color?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }[];
    total: number;
}, {
    data: {
        id: string;
        name: string;
        description?: string | undefined;
        color?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }[];
    total: number;
}>;
export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryParams = z.infer<typeof CategoryParamsSchema>;
export type MediaCategory = z.infer<typeof MediaCategorySchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
export interface CategoryWithStats extends Category {
    mediaCount: number;
    popularityScore: number;
}
