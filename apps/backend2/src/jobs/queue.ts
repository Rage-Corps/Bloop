import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { ScrapingUtils } from '../utils/ScrapingUtils';
import { ScrapingJobData, JobResult } from '../types/queue';

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

        const { pageLinks, baseUrl } = job.data;
        const scrapeUtil = new ScrapingUtils(baseUrl);

        for (const link of pageLinks) {
          console.log('Processing:', link);
          const media = await scrapeUtil.processLink(link);
        }

        console.log(`Completed scraping job ${job.id}`);
        return { 
          message: 'Scraping completed successfully', 
          jobId: job.id || 'unknown' 
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
