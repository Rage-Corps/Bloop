import { z } from 'zod';
// Schema for starting a scraping operation
export const StartScrapingSchema = z.object({
    options: z.object({
        maxDepth: z.number().min(1).max(5).default(1),
        includeImages: z.boolean().default(true),
        includeVideos: z.boolean().default(true),
        waitTime: z.number().min(0).max(10000).default(1000), // milliseconds
        force: z.boolean().default(false), // bypass early termination checks
    }).optional().default({
        maxDepth: 1,
        includeImages: true,
        includeVideos: true,
        waitTime: 1000,
        force: false,
    }),
});
// Schema for scraping job status
export const ScrapingJobSchema = z.object({
    id: z.string(),
    status: z.enum(['pending', 'running', 'paused', 'completed', 'failed', 'cancelled']),
    createdAt: z.string(),
    startedAt: z.string().optional(),
    pausedAt: z.string().optional(),
    completedAt: z.string().optional(),
    // Configuration
    baseUrl: z.string(),
    maxPages: z.number().default(1),
    forceMode: z.boolean().default(false),
    waitTime: z.number().default(1000),
    // Progress tracking
    currentPage: z.number().default(1),
    totalPages: z.number().default(1),
    linksTotal: z.number().default(0),
    linksProcessed: z.number().default(0),
    linksSkipped: z.number().default(0),
    // State persistence
    processedLinks: z.array(z.string()).default([]),
    errorMessage: z.string().optional(),
});
// Schema for job logs
export const JobLogSchema = z.object({
    id: z.string(),
    jobId: z.string(),
    timestamp: z.string(),
    level: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    data: z.record(z.any()).optional(),
});
// Schema for job control actions
export const JobControlSchema = z.object({
    action: z.enum(['pause', 'resume', 'cancel']),
});
// Schema for scraping job parameters
export const ScrapingJobParamsSchema = z.object({
    id: z.string().min(1, 'Job ID parameter is required'),
});
