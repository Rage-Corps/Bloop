export interface BaseJobData {
  id: string
  baseUrl: string
  forceMode: boolean
  waitTime: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

export interface ScrapingJobData extends BaseJobData {
  pageLinks: string[]
}

export interface PageScrapingJobData extends BaseJobData {
  page: number
  pageLinks: string[]
}

export interface JobResult {
  message: string
  jobId: string
  data?: any
}

export interface MediaItem {
  id: string
  name: string
  description: string
  thumbnailUrl: string
  pageUrl: string
  sources?: Array<{
    sourceName: string
    url: string
  }>
  categories?: string[]
}

export interface ScrapingResult {
  mediaItems: MediaItem[]
  totalProcessed: number
  errors: string[]
}