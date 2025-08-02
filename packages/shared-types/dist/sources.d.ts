import { z } from 'zod';
export declare const SourceSchema: z.ZodObject<{
    id: z.ZodString;
    mediaId: z.ZodString;
    sourceName: z.ZodString;
    url: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    mediaId: string;
    sourceName: string;
    url: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    id: string;
    mediaId: string;
    sourceName: string;
    url: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export declare const CreateSourceSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    mediaId: z.ZodString;
    sourceName: z.ZodString;
    url: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    id: string;
    mediaId: string;
    sourceName: string;
    url: string;
}, {
    id: string;
    mediaId: string;
    sourceName: string;
    url: string;
}>;
export declare const UpdateSourceSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    mediaId: z.ZodOptional<z.ZodString>;
    sourceName: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    mediaId?: string | undefined;
    sourceName?: string | undefined;
    url?: string | undefined;
}, {
    mediaId?: string | undefined;
    sourceName?: string | undefined;
    url?: string | undefined;
}>;
export declare const SourceParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const MediaSourceParamsSchema: z.ZodObject<{
    mediaId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    mediaId: string;
}, {
    mediaId: string;
}>;
export declare const BulkCreateSourcesSchema: z.ZodObject<{
    sources: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodString;
        mediaId: z.ZodString;
        sourceName: z.ZodString;
        url: z.ZodString;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
    }, {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    sources: {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
    }[];
}, {
    sources: {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
    }[];
}>;
export declare const SourceListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        mediaId: z.ZodString;
        sourceName: z.ZodString;
        url: z.ZodString;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }, {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }[];
    total: number;
}, {
    data: {
        id: string;
        mediaId: string;
        sourceName: string;
        url: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }[];
    total: number;
}>;
export type Source = z.infer<typeof SourceSchema>;
export type CreateSource = z.infer<typeof CreateSourceSchema>;
export type UpdateSource = z.infer<typeof UpdateSourceSchema>;
export type SourceParams = z.infer<typeof SourceParamsSchema>;
export type MediaSourceParams = z.infer<typeof MediaSourceParamsSchema>;
export type BulkCreateSources = z.infer<typeof BulkCreateSourcesSchema>;
export type SourceListResponse = z.infer<typeof SourceListResponseSchema>;
export interface SourceWithMetadata extends Source {
    isReachable?: boolean;
    lastChecked?: string;
    responseTime?: number;
}
