// Temporal Worker Types

export interface TestWorkflowInput {
  message: string;
  userId?: string;
}

export interface TestWorkflowResult {
  success: boolean;
  message: string;
  mediaCount?: number;
  timestamp: string;
}

export interface DatabaseTestResult {
  mediaCount: number;
  categoriesCount: number;
  sourcesCount: number;
}

export interface MediaProcessingInput {
  mediaId: string;
  action: 'create' | 'update' | 'delete';
  data?: any;
}

export interface MediaProcessingResult {
  success: boolean;
  mediaId: string;
  action: string;
  timestamp: string;
  error?: string;
}

export interface ScrapingWorkflowInput {
  batchSize?: number | null;
  maxPages?: number | null;
  force: boolean;
  baseUrl: string;
}
export interface PageScrapingWorkflowInput {
  pageUrl: string;
  force: boolean;
  baseUrl: string;
}
export interface MediaScrapingWorkflowInput {
  mediaUrl: string;
  force: boolean;
  baseUrl: string;
}
