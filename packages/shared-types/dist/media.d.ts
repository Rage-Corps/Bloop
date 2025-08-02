import { z } from 'zod';
export declare const MediaSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    thumbnailUrl: z.ZodString;
    pageUrl: z.ZodString;
    categories: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>, string[], string[] | undefined>;
    sources: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceName: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sourceName: string;
        url: string;
    }, {
        id: string;
        sourceName: string;
        url: string;
    }>, "many">>>, {
        id: string;
        sourceName: string;
        url: string;
    }[], {
        id: string;
        sourceName: string;
        url: string;
    }[] | undefined>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    pageUrl: string;
    categories: string[];
    sources: {
        id: string;
        sourceName: string;
        url: string;
    }[];
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    pageUrl: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    categories?: string[] | undefined;
    sources?: {
        id: string;
        sourceName: string;
        url: string;
    }[] | undefined;
}>;
export declare const CreateMediaSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    thumbnailUrl: z.ZodString;
    pageUrl: z.ZodString;
    categories: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>, string[], string[] | undefined>;
    sources: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceName: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sourceName: string;
        url: string;
    }, {
        id: string;
        sourceName: string;
        url: string;
    }>, "many">>>, {
        id: string;
        sourceName: string;
        url: string;
    }[], {
        id: string;
        sourceName: string;
        url: string;
    }[] | undefined>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "createdAt" | "updatedAt" | "sources">, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    pageUrl: string;
    categories: string[];
}, {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    pageUrl: string;
    categories?: string[] | undefined;
}>;
export declare const UpdateMediaSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    pageUrl: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>, string[], string[] | undefined>>;
    sources: z.ZodOptional<z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceName: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sourceName: string;
        url: string;
    }, {
        id: string;
        sourceName: string;
        url: string;
    }>, "many">>>, {
        id: string;
        sourceName: string;
        url: string;
    }[], {
        id: string;
        sourceName: string;
        url: string;
    }[] | undefined>>;
    createdAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "createdAt" | "updatedAt" | "sources">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    thumbnailUrl?: string | undefined;
    pageUrl?: string | undefined;
    categories?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    thumbnailUrl?: string | undefined;
    pageUrl?: string | undefined;
    categories?: string[] | undefined;
}>;
export declare const MediaQuerySchema: z.ZodObject<{
    limit: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>, number | undefined, string | number | undefined>;
    offset: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>, number | undefined, string | number | undefined>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    offset?: number | undefined;
    source?: string | undefined;
}, {
    limit?: string | number | undefined;
    offset?: string | number | undefined;
    source?: string | undefined;
}>;
export declare const MediaParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const MediaListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        thumbnailUrl: z.ZodString;
        pageUrl: z.ZodString;
        categories: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>, string[], string[] | undefined>;
        sources: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceName: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            sourceName: string;
            url: string;
        }, {
            id: string;
            sourceName: string;
            url: string;
        }>, "many">>>, {
            id: string;
            sourceName: string;
            url: string;
        }[], {
            id: string;
            sourceName: string;
            url: string;
        }[] | undefined>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description: string;
        thumbnailUrl: string;
        pageUrl: string;
        categories: string[];
        sources: {
            id: string;
            sourceName: string;
            url: string;
        }[];
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }, {
        id: string;
        name: string;
        description: string;
        thumbnailUrl: string;
        pageUrl: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        categories?: string[] | undefined;
        sources?: {
            id: string;
            sourceName: string;
            url: string;
        }[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    filtered: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        description: string;
        thumbnailUrl: string;
        pageUrl: string;
        categories: string[];
        sources: {
            id: string;
            sourceName: string;
            url: string;
        }[];
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
    }[];
    total: number;
    filtered: number;
}, {
    data: {
        id: string;
        name: string;
        description: string;
        thumbnailUrl: string;
        pageUrl: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        categories?: string[] | undefined;
        sources?: {
            id: string;
            sourceName: string;
            url: string;
        }[] | undefined;
    }[];
    total: number;
    filtered: number;
}>;
export type Media = z.infer<typeof MediaSchema>;
export type CreateMedia = z.infer<typeof CreateMediaSchema>;
export type UpdateMedia = z.infer<typeof UpdateMediaSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
export type MediaParams = z.infer<typeof MediaParamsSchema>;
export type MediaListResponse = z.infer<typeof MediaListResponseSchema>;
export interface MediaWithMetadata extends Media {
    sourceCount: number;
    categoryCount: number;
    fileSize?: number;
    dimensions?: {
        width: number;
        height: number;
    };
}
