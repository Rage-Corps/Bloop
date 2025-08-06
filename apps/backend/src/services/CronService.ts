import * as cron from 'node-cron';
import { SettingsDao } from '../dao/settingsDao';

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
    const frequency = frequencySetting?.value || '*/1 * * * *';

    if (this.currentTask) {
      this.currentTask.stop();
    }

    this.currentTask = cron.schedule(frequency, () => {
      console.log(new Date(), 'Hello World - Cron job running');
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
