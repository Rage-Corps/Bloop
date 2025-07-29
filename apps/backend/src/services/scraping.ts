import { randomUUID } from 'crypto';
import * as cheerio from 'cheerio';
import { env } from '../config/index.js';
import type { StartScraping, ScrapingJob } from '../schemas/scraping.js';

class ScrapingService {
  private jobs: Map<string, ScrapingJob> = new Map();
  private activeJobs: Set<string> = new Set();

  startScraping(request: StartScraping): ScrapingJob | { error: string } {
    if (!env.BASE_SCRAPE_URL) {
      return {
        error: 'BASE_SCRAPE_URL environment variable is not configured',
      };
    }

    const jobId = randomUUID();

    const job: ScrapingJob = {
      id: jobId,
      url: env.BASE_SCRAPE_URL,
      source: 'web-scraper',
      status: 'pending',
      startedAt: new Date().toISOString(),
      itemsFound: 0,
      itemsProcessed: 0,
    };

    this.jobs.set(jobId, job);

    // Start the scraping process asynchronously
    this.executeScraping(jobId, request).catch((error) => {
      this.updateJobStatus(jobId, 'failed', error.message);
    });

    return job;
  }

  getJob(jobId: string): ScrapingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScrapingJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  getActiveJobs(): ScrapingJob[] {
    return this.getAllJobs().filter(
      (job) => job.status === 'pending' || job.status === 'running'
    );
  }

  private async executeScraping(
    jobId: string,
    request: StartScraping
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (!env.BASE_SCRAPE_URL) {
      this.updateJobStatus(
        jobId,
        'failed',
        'BASE_SCRAPE_URL environment variable is not configured'
      );
      return;
    }

    try {
      // Update job status to running
      this.updateJobStatus(jobId, 'running');
      this.activeJobs.add(jobId);

      // Simulate scraping process for now
      console.log(
        `Starting scraping job ${jobId} for URL: ${env.BASE_SCRAPE_URL}`
      );

      // Fetch and log HTML content
      const html = await this.fetchPageHTML(env.BASE_SCRAPE_URL);
      console.log(`\n=== HTML Content for ${env.BASE_SCRAPE_URL} ===`);
      console.log(html);
      console.log(`=== End HTML Content ===\n`);

      // Basic processing
      const $ = cheerio.load(html);
      const title = $('title').text();
      const images = $('img').length;

      // Extract all links
      const links: string[] = [];
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
          links.push(href);
        }
      });

      const maxPageIndex = getMaxPageIndex(links, env.BASE_SCRAPE_URL);

      const filteredMediaLinks = filterMediaLinks(links, env.BASE_SCRAPE_URL);

      console.log(`Page title: ${title}`);
      console.log(`Found ${links.length} links and ${images} images`);
      console.log('\n=== All Links Found ===');
      links.forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
      });
      console.log('MAX PAGE', maxPageIndex);
      console.log('=== End Links ===\n');

      // Update job with basic stats
      job.itemsFound = images;
      job.itemsProcessed = images;

      // Simulate processing time
      await this.delay(request.options?.waitTime || 1000);

      this.updateJobStatus(jobId, 'completed');
      console.log(`Scraping job ${jobId} completed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateJobStatus(jobId, 'failed', errorMessage);
      console.error(`Scraping job ${jobId} failed:`, errorMessage);
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  private updateJobStatus(
    jobId: string,
    status: ScrapingJob['status'],
    error?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = status;
    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date().toISOString();
    }
    if (error) {
      job.error = error;
    }

    this.jobs.set(jobId, job);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchPageHTML(url: string): Promise<string> {
    try {
      console.log(`Fetching URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log(`Successfully fetched ${html.length} characters from ${url}`);

      return html;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // Method to cancel a running job
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || (job.status !== 'pending' && job.status !== 'running')) {
      return false;
    }

    this.updateJobStatus(jobId, 'failed', 'Job cancelled by user');
    this.activeJobs.delete(jobId);
    return true;
  }

  // Cleanup completed jobs older than 24 hours
  cleanupOldJobs(): number {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    let cleanedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      const jobTime = new Date(job.startedAt).getTime();
      if (
        jobTime < cutoffTime &&
        (job.status === 'completed' || job.status === 'failed')
      ) {
        this.jobs.delete(jobId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Export singleton instance
export const scrapingService = new ScrapingService();

function getMaxPageIndex(links: string[], baseScrapUrl: string): number {
  const pagePattern = /\/page\/(\d+)\/$/;
  let maxIndex = 0;

  for (const link of links) {
    const match = link.match(pagePattern);
    if (match) {
      const pageIndex = parseInt(match[1], 10);
      if (pageIndex > maxIndex) {
        maxIndex = pageIndex;
      }
    }
  }

  return maxIndex;
}

function filterMediaLinks(links: string[], baseScrapUrl: string) {
  const baseUrl = new URL(baseScrapUrl).origin;
  const uniqueLinks = new Set<string>();
  const excludePaths = ['/contact-us', '/legal-notice', '/page', '/category'];

  for (const link of links) {
    if (link.startsWith(baseUrl)) {
      // Exclude base URL and base URL with trailing slash
      if (link === baseUrl || link === `${baseUrl}/`) {
        continue;
      }

      const shouldExclude = excludePaths.some((path) =>
        link.includes(`${baseUrl}${path}`)
      );

      if (!shouldExclude) {
        uniqueLinks.add(link);
      }
    }
  }

  return Array.from(uniqueLinks);
}
