import { z } from 'zod';

// Common pagination schema
export const PaginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseInt(val);
      return val || 1;
    }),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseInt(val);
      return val || 20;
    }),
  offset: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseInt(val);
      return val;
    }),
});

// Common API response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  });

// Error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

// Health check schema
export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string().datetime(),
  uptime: z.number(),
  version: z.string(),
  database: z.object({
    connected: z.boolean(),
    responseTime: z.number().optional(),
  }),
});

// Search/Filter common schemas
export const SearchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Type exports
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

// Common utility types
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

// Combine common entity traits
export interface BaseEntity extends IdentifiableEntity, TimestampedEntity {}
export interface NamedBaseEntity extends BaseEntity, NamedEntity {}