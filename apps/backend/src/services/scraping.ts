import { randomUUID } from 'crypto';
import * as cheerio from 'cheerio';
import { env } from '../config/index.js';
import type { StartScraping, ScrapingJob } from '../schemas/scraping.js';
import { mediaDatabase } from '../database/media.js';
import { sourcesDatabase } from '../database/sources.js';
import { categoriesDatabase } from '../database/categories.js';
import { jobsDatabase } from '../database/jobs.js';

// Common HTTP headers for web scraping
const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  DNT: '1',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

class ScrapingService {
  private activeJobIds: Set<string> = new Set();
  private MAX_PAGE = 3;

  constructor() {
    // Initialize recovery on startup
    this.initializeRecovery();
  }

  startScraping(request: StartScraping): ScrapingJob | { error: string } {
    if (!env.BASE_SCRAPE_URL) {
      return {
        error: 'BASE_SCRAPE_URL environment variable is not configured',
      };
    }

    // Create persistent job
    const job = jobsDatabase.createJob({
      baseUrl: env.BASE_SCRAPE_URL,
      maxPages: 10, // Will be updated when we discover actual max pages
      forceMode: request.options?.force || false,
      waitTime: request.options?.waitTime || 1000,
    });

    // Log job creation
    jobsDatabase.logActivity(job.id, 'info', 'Job created', {
      baseUrl: env.BASE_SCRAPE_URL,
      forceMode: job.forceMode,
    });

    // Start the scraping process asynchronously
    this.executeScraping(job.id, request).catch((error) => {
      jobsDatabase.updateJobStatus(job.id, 'failed', error.message);
      jobsDatabase.logActivity(job.id, 'error', 'Job failed', {
        error: error.message,
      });
      this.activeJobIds.delete(job.id);
    });

    return job;
  }

  getJob(jobId: string): ScrapingJob | undefined {
    return jobsDatabase.getJobById(jobId);
  }

  getAllJobs(): ScrapingJob[] {
    return jobsDatabase.getAllJobs();
  }

  getActiveJobs(): ScrapingJob[] {
    return jobsDatabase.getActiveJobs();
  }

  // Job control methods
  pauseJob(jobId: string): boolean {
    const job = jobsDatabase.getJobById(jobId);
    if (!job || job.status !== 'running') {
      return false;
    }

    jobsDatabase.updateJobStatus(jobId, 'paused');
    jobsDatabase.logActivity(jobId, 'info', 'Job paused by user');
    return true;
  }

  resumeJob(jobId: string): boolean {
    const job = jobsDatabase.getJobById(jobId);
    if (!job || job.status !== 'paused') {
      return false;
    }

    jobsDatabase.updateJobStatus(jobId, 'running');
    jobsDatabase.logActivity(jobId, 'info', 'Job resumed by user');

    // Resume execution from where it left off
    this.resumeScraping(jobId).catch((error) => {
      jobsDatabase.updateJobStatus(jobId, 'failed', error.message);
      jobsDatabase.logActivity(jobId, 'error', 'Job failed on resume', {
        error: error.message,
      });
      this.activeJobIds.delete(jobId);
    });

    return true;
  }

  cancelJob(jobId: string): boolean {
    const job = jobsDatabase.getJobById(jobId);
    if (!job || ['completed', 'failed', 'cancelled'].includes(job.status)) {
      return false;
    }

    jobsDatabase.updateJobStatus(jobId, 'cancelled', 'Job cancelled by user');
    jobsDatabase.logActivity(jobId, 'info', 'Job cancelled by user');
    this.activeJobIds.delete(jobId);
    return true;
  }

  private async executeScraping(
    jobId: string,
    request: StartScraping
  ): Promise<void> {
    const job = jobsDatabase.getJobById(jobId);
    if (!job) return;

    if (!env.BASE_SCRAPE_URL) {
      jobsDatabase.updateJobStatus(
        jobId,
        'failed',
        'BASE_SCRAPE_URL environment variable is not configured'
      );
      jobsDatabase.logActivity(
        jobId,
        'error',
        'BASE_SCRAPE_URL not configured'
      );
      return;
    }

    try {
      // Update job status to running
      jobsDatabase.updateJobStatus(jobId, 'running');
      this.activeJobIds.add(jobId);

      jobsDatabase.logActivity(
        jobId,
        'info',
        `Starting scraping job for URL: ${env.BASE_SCRAPE_URL}`
      );

      // Fetch and extract links
      const html = await this.fetchPageHTML(env.BASE_SCRAPE_URL);
      const $ = cheerio.load(html);
      const title = $('title').text();

      const links = this.extractLinksFromHTML(html);
      const maxPageIndex = this.getMaxPageIndex(links, env.BASE_SCRAPE_URL);
      const filteredMediaLinks = this.filterMediaLinks(links, env.BASE_SCRAPE_URL);

      // Update job with discovered information
      jobsDatabase.updateJobProgress(jobId, {
        totalPages: maxPageIndex,
        linksTotal: filteredMediaLinks.length,
      });

      jobsDatabase.logActivity(
        jobId,
        'info',
        `Found ${filteredMediaLinks.length} media links across ${maxPageIndex} pages`,
        {
          title,
          totalLinks: links.length,
          maxPages: maxPageIndex,
        }
      );

      console.log(`Page title: ${title}`);
      console.log(`Found ${links.length} links`);
      console.log('\n=== All Links Found ===');
      filteredMediaLinks.forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
      });
      console.log('MAX PAGE', maxPageIndex);
      console.log('=== End Links ===\n');

      await this.handleMediaLinks(
        filteredMediaLinks,
        request.options?.force || false,
        request.options?.waitTime || 1000,
        jobId
      );

      // Simulate processing time
      await this.delay(request.options?.waitTime || 1000);

      jobsDatabase.updateJobStatus(jobId, 'completed');
      jobsDatabase.logActivity(jobId, 'info', 'Job completed successfully');
      console.log(`Scraping job ${jobId} completed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      jobsDatabase.updateJobStatus(jobId, 'failed', errorMessage);
      jobsDatabase.logActivity(jobId, 'error', 'Job failed', {
        error: errorMessage,
      });
      console.error(`Scraping job ${jobId} failed:`, errorMessage);
    } finally {
      this.activeJobIds.delete(jobId);
    }
  }

  // Recovery methods
  private async initializeRecovery(): Promise<void> {
    const activeJobs = jobsDatabase.getActiveJobs();

    for (const job of activeJobs) {
      if (job.status === 'running') {
        // Mark interrupted jobs as paused
        jobsDatabase.updateJobStatus(
          job.id,
          'paused',
          'Server restart - job was running'
        );
        jobsDatabase.logActivity(
          job.id,
          'warning',
          'Job paused due to server restart'
        );
      }
    }

    console.log(
      `📊 Recovery: Found ${activeJobs.length} active jobs, marked running jobs as paused`
    );
  }

  private async resumeScraping(jobId: string): Promise<void> {
    const job = jobsDatabase.getJobById(jobId);
    if (!job) return;

    jobsDatabase.logActivity(jobId, 'info', 'Resuming job from saved state');

    try {
      // Resume from where we left off
      // This would need more sophisticated state management for full resume capability
      // For now, we'll restart the job but skip already processed links
      const request: StartScraping = {
        options: {
          force: job.forceMode,
          waitTime: job.waitTime,
        },
      };

      await this.executeScraping(jobId, request);
    } catch (error) {
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cleanup completed jobs older than 24 hours
  cleanupOldJobs(): number {
    return jobsDatabase.cleanupOldJobs();
  }

  // Private utility methods
  private getMaxPageIndex(links: string[], baseScrapUrl: string): number {
    const pagePattern = /\/page\/(\d+)\/$/;
    let maxIndex = 0;

    for (const link of links) {
      if (link.startsWith(baseScrapUrl)) {
        const match = link.match(pagePattern);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      }
    }

    return maxIndex;
  }

  private filterMediaLinks(links: string[], baseScrapUrl: string) {
    const cleanBaseUrl = baseScrapUrl.replace(/\/+$/, '');
    return links.filter((link) => {
      const cleanLink = link.replace(/\/+$/, '');
      return (
        cleanLink.startsWith(cleanBaseUrl) &&
        cleanLink !== cleanBaseUrl &&
        !cleanLink.includes('/page/')
      );
    });
  }

  private async fetchPageHTML(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.text();
  }

  private extractLinksFromHTML(html: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        links.push(href);
      }
    });

    return links;
  }

  private getMediaLinkThumbnailAndName(
    $: cheerio.CheerioAPI
  ): { thumbnailUrl: string; name: string } | null {
    const thumbnailElement = $('.rmbd img');
    if (thumbnailElement.length > 0) {
      const thumbnailUrl = thumbnailElement.attr('src') || '';
      const name = thumbnailElement.attr('alt') || 'Untitled';
      return { thumbnailUrl, name };
    }
    return null;
  }

  private getMediaLinkInfo(
    $: cheerio.CheerioAPI
  ): { description: string } | null {
    const descriptionElement = $('.wp-block-columns p').first();
    if (descriptionElement.length > 0) {
      const description = descriptionElement.text().trim();
      return { description };
    }
    return null;
  }

  private getMediaSources($: cheerio.CheerioAPI): { source: string; url: string }[] {
    const sources: { source: string; url: string }[] = [];
    $('.wp-block-columns a').each((_, element) => {
      const url = $(element).attr('href');
      const text = $(element).text().trim();
      if (url && text) {
        sources.push({ source: text, url });
      }
    });
    return sources;
  }

  private getMediaLinkCategories($: cheerio.CheerioAPI): string[] {
    const categories: string[] = [];
    $('.entry-categories a, .cat-links a').each((_, element) => {
      const category = $(element).text().trim();
      if (category) {
        categories.push(category);
      }
    });
    return categories;
  }

  private storeMedia(
    media: {
      name: string | undefined;
      description: string | undefined;
      thumbnailUrl: string | undefined;
      sources: { source: string; url: string }[];
      categories: string[];
    },
    mediaSources: { source: string; url: string }[],
    mediaCategories: string[],
    link: string
  ) {
    if (
      media.name &&
      media.description &&
      media.thumbnailUrl &&
      mediaSources.length > 0
    ) {
      try {
        // Check if media already exists by pageUrl
        const existingMedia = mediaDatabase.getMediaByPageUrl(link);
        
        if (existingMedia) {
          // Update existing media
          const updated = mediaDatabase.updateMedia(existingMedia.id, {
            name: media.name,
            description: media.description,
            thumbnailUrl: media.thumbnailUrl,
          });

          // Get existing sources
          const existingSources = sourcesDatabase.getSourcesByMediaId(existingMedia.id);
          
          // For simplicity, we'll replace sources if they're different
          // In a more sophisticated approach, we could compare and only update changed ones
          const sourcesChanged = existingSources.length !== mediaSources.length ||
            !mediaSources.every(newSource => 
              existingSources.some(existing => 
                existing.sourceName === newSource.source && existing.url === newSource.url
              )
            );

          if (sourcesChanged) {
            // Only delete and re-add if sources actually changed
            sourcesDatabase.deleteSourcesByMediaId(existingMedia.id);
            
            const sources = mediaSources.map((source) => ({
              id: randomUUID(),
              mediaId: existingMedia.id,
              sourceName: source.source,
              url: source.url,
            }));

            sourcesDatabase.addSources(sources);
          }

          // Check if categories changed
          const existingCategories = categoriesDatabase.getCategoryNamesByMediaId(existingMedia.id);
          const categoriesChanged = existingCategories.length !== mediaCategories.length ||
            !mediaCategories.every(category => existingCategories.includes(category));

          if (categoriesChanged) {
            // Update categories
            categoriesDatabase.deleteCategoriesByMediaId(existingMedia.id);
            if (mediaCategories.length > 0) {
              categoriesDatabase.addCategories(mediaCategories, existingMedia.id);
            }
          }

          console.log(
            `🔄 Updated existing media "${media.name}" ${sourcesChanged ? 'with updated sources' : '(sources unchanged)'} ${categoriesChanged ? 'with updated categories' : '(categories unchanged)'}`
          );
        } else {
          // Create new media
          const mediaId = randomUUID();

          mediaDatabase.addMedia({
            id: mediaId,
            name: media.name,
            description: media.description,
            thumbnailUrl: media.thumbnailUrl,
            pageUrl: link,
            categories: [], // Will be populated separately
          });

          const sources = mediaSources.map((source) => ({
            id: randomUUID(),
            mediaId: mediaId,
            sourceName: source.source,
            url: source.url,
          }));

          sourcesDatabase.addSources(sources);

          // Add categories if any
          if (mediaCategories.length > 0) {
            categoriesDatabase.addCategories(mediaCategories, mediaId);
          }

          console.log(
            `✅ Saved new media "${media.name}" with ${sources.length} sources and ${mediaCategories.length} categories to database`
          );
        }
      } catch (error) {
        console.error('❌ Failed to save/update media in database:', error);
      }
    } else {
      console.log('⚠️ Missing required data, not saving to database');
    }
  }

  private async processLink(
    link: string,
    force: boolean = false,
    jobId?: string
  ) {
    try {
      // Check if link already exists in database (unless force mode is enabled)
      if (!force && mediaDatabase.pageUrlExists(link)) {
        console.log(`⏭️ Skipped ${link} - already exists in database`);

        // Update progress
        if (jobId) {
          const job = jobsDatabase.getJobById(jobId);
          if (job) {
            jobsDatabase.updateJobProgress(jobId, {
              linksSkipped: job.linksSkipped + 1,
            });
          }
        }
        return;
      }

      console.log(`Processing link: ${link}`);

      const html = await this.fetchPageHTML(link);

      const $ = cheerio.load(html);
      const thumbnailNameResult = this.getMediaLinkThumbnailAndName($);

      if (thumbnailNameResult) {
        const { thumbnailUrl, name } = thumbnailNameResult;
        console.log(`Thumbnail URL: ${thumbnailUrl}`);
        console.log(`Name: ${name}`);
      } else {
        console.log('No thumbnail found with class "rmbd"');
      }

      const mediaInfo = this.getMediaLinkInfo($);

      const mediaCategories = this.getMediaLinkCategories($);

      if (mediaCategories.length > 0) {
        console.log(`Categories: ${mediaCategories.join(', ')}`);
      } else {
        console.log('No categories found');
      }

      if (mediaInfo) {
        console.log(`Description: ${mediaInfo.description}`);
      } else {
        console.log('No description found');
      }

      const mediaSources = this.getMediaSources($);

      if (mediaSources.length > 0) {
        console.log(`Found ${mediaSources.length} media sources:`);
        mediaSources.forEach((source, index) => {
          console.log(`${index + 1}. ${source.source}: ${source.url}`);
        });
      } else {
        console.log('No media sources found');
      }

      const media = {
        name: thumbnailNameResult?.name,
        description: mediaInfo?.description,
        thumbnailUrl: thumbnailNameResult?.thumbnailUrl,
        sources: mediaSources,
        categories: mediaCategories,
      };

      // Store to database if we have the required data
      this.storeMedia(media, mediaSources, mediaCategories, link);

      // Update progress
      if (jobId) {
        const job = jobsDatabase.getJobById(jobId);
        if (job) {
          jobsDatabase.updateJobProgress(jobId, {
            linksProcessed: job.linksProcessed + 1,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing link ${link}:`, error);
    }
  }

  private async handleMediaLinks(
    mediaLinks: string[],
    force: boolean,
    waitTime: number,
    jobId: string
  ) {
    console.log(`Processing ${mediaLinks.length} media links...`);

    for (let i = 0; i < mediaLinks.length; i++) {
      const link = mediaLinks[i];

      // Check if job was cancelled
      const job = jobsDatabase.getJobById(jobId);
      if (!job || job.status === 'cancelled') {
        console.log('Job was cancelled, stopping processing');
        return;
      }

      console.log(`\n📄 Processing media link ${i + 1}/${mediaLinks.length}: ${link}`);

      try {
        await this.processLink(link, force, jobId);

        // Add delay between requests to be respectful
        if (i < mediaLinks.length - 1 && waitTime > 0) {
          console.log(`⏱️ Waiting ${waitTime}ms before next request...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        console.error(`❌ Failed to process ${link}:`, error);
        // Continue with next link even if one fails
      }
    }
  }


  private async processPage(
    pageIndex: number,
    baseUrl: string,
    force: boolean = false,
    jobId?: string
  ): Promise<boolean> {
    const pageUrl = `${baseUrl}page/${pageIndex}`;
    console.log(`\nFetching page ${pageIndex}: ${pageUrl}`);

    const pageMediaLinks = await this.fetchAndExtractLinks(pageUrl, baseUrl);
    console.log(
      `Found ${pageMediaLinks.length} media links on page ${pageIndex}`
    );

    if (!force) {
      // Check if all links already exist
      if (pageMediaLinks.length > 0) {
        const existingCount = pageMediaLinks.filter((link) =>
          mediaDatabase.pageUrlExists(link)
        ).length;

        console.log(
          `📊 Page ${pageIndex}: ${existingCount}/${pageMediaLinks.length} links already exist`
        );

        // If all links exist, stop processing further pages
        if (existingCount === pageMediaLinks.length) {
          console.log(
            `⏭️ Skipping page ${pageIndex} - all ${pageMediaLinks.length} links already exist`
          );
          return true; // Signal to stop processing
        }
      }
    }

    // Process the links
    for (let i = 0; i < pageMediaLinks.length; i++) {
      const link = pageMediaLinks[i];

      // Check if job was cancelled
      if (jobId) {
        const job = jobsDatabase.getJobById(jobId);
        if (!job || job.status === 'cancelled') {
          console.log('Job was cancelled, stopping processing');
          return true;
        }
      }

      console.log(
        `\n📄 Processing media link ${i + 1}/${pageMediaLinks.length}: ${link}`
      );

      await this.processLink(link, force, jobId);
    }

    return false; // Continue processing
  }

  private async fetchAndExtractLinks(
    pageUrl: string,
    baseUrl: string
  ): Promise<string[]> {
    const html = await this.fetchPageHTML(pageUrl);
    const links = this.extractLinksFromHTML(html);
    return this.filterMediaLinks(links, baseUrl);
  }
}

// Export singleton instance
export const scrapingService = new ScrapingService();
