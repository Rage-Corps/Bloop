import { z } from 'zod';

// Schema for starting a scraping operation
export const StartScrapingSchema = z.object({
  options: z.object({
    maxDepth: z.number().min(1).max(5).default(1),
    includeImages: z.boolean().default(true),
    includeVideos: z.boolean().default(true),
    waitTime: z.number().min(0).max(10000).default(1000), // milliseconds
  }).optional().default({
    maxDepth: 1,
    includeImages: true,
    includeVideos: true,
    waitTime: 1000,
  }),
});

// Schema for scraping job status
export const ScrapingJobSchema = z.object({
  id: z.string(),
  url: z.string(),
  source: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  itemsFound: z.number().default(0),
  itemsProcessed: z.number().default(0),
  error: z.string().optional(),
});

// Schema for scraping job parameters
export const ScrapingJobParamsSchema = z.object({
  id: z.string().min(1, 'Job ID parameter is required'),
});

// Type exports
export type StartScraping = z.infer<typeof StartScrapingSchema>;
export type ScrapingJob = z.infer<typeof ScrapingJobSchema>;
export type ScrapingJobParams = z.infer<typeof ScrapingJobParamsSchema>;