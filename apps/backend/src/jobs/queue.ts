import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { ScrapingUtils } from '../utils/ScrapingUtils';
import { ScrapingJobData, JobResult } from '../types/queue';
import { MediaDao } from '../dao/mediaDao';

const connectionConfig = {
  host: 'redis',
  port: 6379,
  maxRetriesPerRequest: null,
  retryDelayOnFailure: 100,
  connectTimeout: 10000,
  lazyConnect: true,
};

const connection = new IORedis(connectionConfig);

connection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export const scrapingQueue = new Queue<ScrapingJobData>('scraping', {
  connection: connection.duplicate(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

let scrapingWorker: Worker | null = null;

// Helper functions for media validation and processing
function validateMediaObject(
  media: any,
  _link: string
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!media.name || media.name.trim() === '') missingFields.push('name');
  if (!media.description || media.description.trim() === '')
    missingFields.push('description');
  if (!media.thumbnailUrl || media.thumbnailUrl.trim() === '')
    missingFields.push('thumbnailUrl');

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

function processMediaSources(
  sources: any[],
  mediaName: string
): Array<{ sourceName: string; url: string }> {
  if (!Array.isArray(sources)) return [];

  return sources
    .filter((source) => {
      if (!source.source || !source.url) {
        console.warn(
          `⚠️ Invalid source for ${mediaName} - missing source or url`
        );
        return false;
      }
      return true;
    })
    .map((source) => ({
      sourceName: source.source, // Map 'source' to 'sourceName' for database
      url: source.url,
    }));
}

function processMediaCategories(
  categories: any[],
  mediaName: string
): string[] {
  if (!Array.isArray(categories)) return [];

  return categories.filter((category) => {
    if (typeof category !== 'string' || category.trim() === '') {
      console.warn(`⚠️ Invalid category for ${mediaName} - not a valid string`);
      return false;
    }
    return true;
  });
}

async function processAndSaveMedia(
  media: any,
  link: string,
  mediaDao: MediaDao
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateMediaObject(media, link);

    if (!validation.isValid) {
      const errorMsg = `Missing required fields: ${validation.missingFields.join(', ')}`;
      console.error(`❌ Invalid media object for ${link} - ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const validSources = processMediaSources(media.sources, media.name);
    const validCategories = processMediaCategories(
      media.categories,
      media.name
    );

    // Upsert media to database (create or update based on pageUrl)
    const savedMedia = await mediaDao.upsertMedia({
      name: media.name!.trim(),
      description: media.description!.trim(),
      thumbnailUrl: media.thumbnailUrl!.trim(),
      pageUrl: link,
      sources: validSources,
      categories: validCategories,
    });

    console.log(`💾 Upserted media: ${savedMedia.name} (ID: ${savedMedia.id})`);
    return { success: true };
  } catch (dbError) {
    const errorMsg = `Database error - ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`;
    console.error(`❌ Database error saving media for ${link}:`, dbError);
    return { success: false, error: errorMsg };
  }
}

async function processScrapingLinks(
  linksToProcess: string[],
  scrapeUtil: ScrapingUtils,
  mediaDao: MediaDao
): Promise<{ processedCount: number; savedCount: number; errors: string[] }> {
  let processedCount = 0;
  let savedCount = 0;
  const errors: string[] = [];

  for (const link of linksToProcess) {
    try {
      console.log('Processing:', link);
      const media = await scrapeUtil.processLink(link);

      if (media) {
        const result = await processAndSaveMedia(media, link, mediaDao);
        if (result.success) {
          savedCount++;
        } else {
          errors.push(`${link}: ${result.error}`);
        }
      } else {
        console.warn(`⚠️ No media object returned for ${link}`);
      }

      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing link ${link}:`, error);
      errors.push(
        `${link}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return { processedCount, savedCount, errors };
}

export const initializeWorker = async () => {
  try {
    await connection.connect();

    scrapingWorker = new Worker<ScrapingJobData, JobResult>(
      'scraping',
      async (job: Job<ScrapingJobData>): Promise<JobResult> => {
        console.log(`Processing scraping job ${job.id}:`, job.data);

        const { pageLinks, baseUrl, forceMode = false } = job.data;
        const scrapeUtil = new ScrapingUtils(baseUrl);
        const mediaDao = new MediaDao();

        // Check existing page links unless force mode is enabled
        const { existingCount, newLinks } =
          await mediaDao.checkExistingPageLinks(pageLinks);

        console.log(
          `📊 Page links analysis - Total: ${pageLinks.length}, Existing: ${existingCount}, New: ${newLinks.length}`
        );

        // Determine if we should skip processing
        let shouldSkip = false;
        let linksToProcess = pageLinks;

        if (!forceMode) {
          // If all links already exist, skip processing
          if (existingCount === pageLinks.length) {
            shouldSkip = true;
            console.log(
              `⏭️ Skipping job ${job.id} - all ${pageLinks.length} links already exist in database`
            );
          }
          // Process only new links
          else if (newLinks.length > 0) {
            linksToProcess = newLinks;
            console.log(
              `🔄 Processing only ${newLinks.length} new links (${existingCount} already exist)`
            );
          }
        } else {
          console.log(
            `🔥 Force mode enabled - processing all ${pageLinks.length} links regardless of existing data`
          );
        }

        if (shouldSkip) {
          return {
            message: `Skipped processing - ${existingCount}/${pageLinks.length} links already exist. Use forceMode to override.`,
            jobId: job.id || 'unknown',
            data: {
              skipped: true,
              existingCount,
              totalLinks: pageLinks.length,
            },
          };
        }

        // Process the links using extracted function
        const { processedCount, savedCount, errors } =
          await processScrapingLinks(linksToProcess, scrapeUtil, mediaDao);

        console.log(
          `✅ Completed scraping job ${job.id} - processed ${processedCount} links, saved ${savedCount} media items`
        );

        return {
          message: `Scraping completed successfully - processed ${processedCount} links, saved ${savedCount} media items`,
          jobId: job.id || 'unknown',
          data: {
            processedCount,
            savedCount,
            skippedCount: existingCount,
            errors: errors.length > 0 ? errors : undefined,
          },
        };
      },
      {
        connection: connection.duplicate(),
        concurrency: 2,
      }
    );

    scrapingWorker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    scrapingWorker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    console.log('✅ Worker initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize worker:', error);
  }
};

export { connection as redisConnection, scrapingWorker };
