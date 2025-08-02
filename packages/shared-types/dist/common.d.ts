import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>, number, string | number | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>, number, string | number | undefined>;
    offset: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>, number | undefined, string | number | undefined>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    offset?: number | undefined;
}, {
    page?: string | number | undefined;
    limit?: string | number | undefined;
    offset?: string | number | undefined;
}>;
export declare const ApiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: T;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: T;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: T;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: false;
    error: string;
    code?: string | undefined;
    details?: Record<string, any> | undefined;
    timestamp?: string | undefined;
}, {
    success: false;
    error: string;
    code?: string | undefined;
    details?: Record<string, any> | undefined;
    timestamp?: string | undefined;
}>;
export declare const HealthCheckSchema: z.ZodObject<{
    status: z.ZodEnum<["healthy", "degraded", "unhealthy"]>;
    timestamp: z.ZodString;
    uptime: z.ZodNumber;
    version: z.ZodString;
    database: z.ZodObject<{
        connected: z.ZodBoolean;
        responseTime: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        connected: boolean;
        responseTime?: number | undefined;
    }, {
        connected: boolean;
        responseTime?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    version: string;
    database: {
        connected: boolean;
        responseTime?: number | undefined;
    };
}, {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    version: string;
    database: {
        connected: boolean;
        responseTime?: number | undefined;
    };
}>;
export declare const SearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    query?: string | undefined;
    filters?: Record<string, any> | undefined;
    sortBy?: string | undefined;
}, {
    query?: string | undefined;
    filters?: Record<string, any> | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
    timestamp?: string;
};
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type Search = z.infer<typeof SearchSchema>;
export interface TimestampedEntity {
    createdAt?: string;
    updatedAt?: string;
}
export interface IdentifiableEntity {
    id: string;
}
export interface NamedEntity {
    name: string;
}
export interface BaseEntity extends IdentifiableEntity, TimestampedEntity {
}
export interface NamedBaseEntity extends BaseEntity, NamedEntity {
}
