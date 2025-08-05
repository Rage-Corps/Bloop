import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

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

export const scrapingQueue = new Queue('scraping', {
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

    scrapingWorker = new Worker(
      'scraping',
      async (job) => {
        console.log(`Processing scraping job ${job.id}:`, job.data);

        const { pageLinks } = job.data;
        console.log('MEDid', pageLinks);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log(`Completed scraping job ${job.id}`);
        return { message: 'Scraping completed successfully', jobId: job.id };
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
