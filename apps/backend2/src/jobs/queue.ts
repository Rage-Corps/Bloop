import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { ScrapingUtils } from '../utils/ScrapingUtils';
import { ScrapingJobData, JobResult } from '../types/queue';
import { MediaHelper } from '../helpers/mediaHelper';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

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

export const initializeWorker = async () => {
  try {
    await connection.connect();

    scrapingWorker = new Worker<ScrapingJobData, JobResult>(
      'scraping',
      async (job: Job<ScrapingJobData>): Promise<JobResult> => {
        console.log(`Processing scraping job ${job.id}:`, job.data);

        const { pageLinks, baseUrl, forceMode = false } = job.data;
        const scrapeUtil = new ScrapingUtils(baseUrl);
        const mediaHelper = new MediaHelper();

        // Check existing page links unless force mode is enabled
        const { existingCount, newLinks } =
          await mediaHelper.checkExistingPageLinks(pageLinks);

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

        // Process the links
        let processedCount = 0;
        let savedCount = 0;
        const errors: string[] = [];

        for (const link of linksToProcess) {
          try {
            console.log('Processing:', link);
            const media = await scrapeUtil.processLink(link);
            
            if (media) {
              // Validate required fields (pageUrl comes from the link being processed)
              const missingFields: string[] = [];
              
              if (!media.name || media.name.trim() === '') missingFields.push('name');
              if (!media.description || media.description.trim() === '') missingFields.push('description');
              if (!media.thumbnailUrl || media.thumbnailUrl.trim() === '') missingFields.push('thumbnailUrl');
              
              if (missingFields.length > 0) {
                console.error(`❌ Invalid media object for ${link} - missing required fields: ${missingFields.join(', ')}`);
                errors.push(`${link}: Missing required fields: ${missingFields.join(', ')}`);
              } else {
                try {
                  // Ensure sources and categories are arrays or set defaults
                  const sources = Array.isArray(media.sources) ? media.sources : [];
                  const categories = Array.isArray(media.categories) ? media.categories : [];
                  
                  // Validate sources structure if present (sources have 'source' property, not 'sourceName')
                  const validSources = sources.filter(source => {
                    if (!source.source || !source.url) {
                      console.warn(`⚠️ Invalid source for ${media.name} - missing source or url`);
                      return false;
                    }
                    return true;
                  }).map(source => ({
                    sourceName: source.source, // Map 'source' to 'sourceName' for database
                    url: source.url
                  }));
                  
                  // Validate categories are strings if present
                  const validCategories = categories.filter(category => {
                    if (typeof category !== 'string' || category.trim() === '') {
                      console.warn(`⚠️ Invalid category for ${media.name} - not a valid string`);
                      return false;
                    }
                    return true;
                  });

                  // Upsert media to database (create or update based on pageUrl)
                  const savedMedia = await mediaHelper.upsertMedia({
                    name: media.name!.trim(), // Non-null assertion since we validated above
                    description: media.description!.trim(),
                    thumbnailUrl: media.thumbnailUrl!.trim(),
                    pageUrl: link, // Use the link being processed as pageUrl
                    sources: validSources,
                    categories: validCategories
                  });
                  
                  console.log(`💾 Upserted media: ${savedMedia.name} (ID: ${savedMedia.id})`);
                  savedCount++;
                } catch (dbError) {
                  console.error(`❌ Database error saving media for ${link}:`, dbError);
                  errors.push(`${link}: Database error - ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
                }
              }
            } else {
              console.warn(`⚠️ No media object returned for ${link}`);
            }
            
            processedCount++;
          } catch (error) {
            console.error(`❌ Error processing link ${link}:`, error);
            errors.push(`${link}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

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
            errors: errors.length > 0 ? errors : undefined
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
