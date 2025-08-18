import * as cron from 'node-cron';
import { SettingsDao } from '../dao/settingsDao';
import { ScrapingUtils } from '../utils/ScrapingUtils';
import { scrapingQueue } from '../jobs/queue';

export class CronService {
  private settingsDao: SettingsDao;
  private currentTask: cron.ScheduledTask | null = null;

  constructor() {
    this.settingsDao = new SettingsDao();
  }

  async initialize(): Promise<void> {
    await this.settingsDao.initializeDefaults();
  }

  async start(): Promise<void> {
    const isEnabled = await this.settingsDao.getBooleanSetting(
      'cron.enabled',
      true
    );

    if (!isEnabled) {
      console.log('🕒 Cron service is disabled');
      return;
    }

    const frequencySetting =
      await this.settingsDao.getSetting('cron.frequency');
    const frequency = frequencySetting?.value || '* */6 * * *';

    if (this.currentTask) {
      this.currentTask.stop();
    }

    this.currentTask = cron.schedule(frequency, async () => {
      try {
        const baseUrl = process.env.BASE_SCRAPE_URL;

        if (!baseUrl) {
          console.error('🕒 BASE_SCRAPE_URL not configured on Schedule');
          return { error: 'BASE_SCRAPE_URL not configured on Schedule' };
        }

        const waitingJobs = await scrapingQueue.getWaiting();

        if (waitingJobs.length) {
          console.log(`🕒 Things are still waiting did not do cron`);
          return { message: 'Jobs still in queue, skipping cron execution' };
        }

        const scrapeUtil = new ScrapingUtils(baseUrl);

        const jobIds = await scrapeUtil.startScrape(
          {
            forceMode: false,
          },
          scrapingQueue
        );

        console.log(`🕒 Cron job executed successfully, started jobs: ${jobIds.join(',')}`);
        return jobIds;
      } catch (error) {
        console.error('🕒 Cron job failed with error:', error);
        console.log('🕒 Cron will retry on next scheduled execution');
        // Don't throw the error to prevent cron from stopping
        return { error: 'Cron job failed, will retry on next execution' };
      }
    });

    console.log(`🕒 Cron job scheduled with frequency: ${frequency}`);
  }

  async updateConfiguration(
    enabled: boolean,
    frequency: string
  ): Promise<void> {
    await this.settingsDao.setBooleanSetting('cron.enabled', enabled);
    await this.settingsDao.setSetting({
      key: 'cron.frequency',
      value: frequency,
    });

    console.log('🔄 Restarting cron service with new configuration...');
    await this.restart();
  }

  async restart(): Promise<void> {
    this.stop();
    await this.start();
  }

  async getConfiguration(): Promise<{ enabled: boolean; frequency: string }> {
    const enabled = await this.settingsDao.getBooleanSetting(
      'cron.enabled',
      true
    );
    const frequencySetting =
      await this.settingsDao.getSetting('cron.frequency');
    const frequency = frequencySetting?.value || '*/1 * * * *';

    return { enabled, frequency };
  }

  stop() {
    if (this.currentTask) {
      this.currentTask.stop();
      this.currentTask = null;
    }
  }
}
