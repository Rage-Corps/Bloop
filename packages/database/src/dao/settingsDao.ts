import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { settings } from '../schema';

export interface SettingInput {
  key: string;
  value: string;
}

export interface SettingItem {
  key: string;
  value: string;
  updatedAt: Date | null;
}

export class SettingsDao {
  async getSetting(key: string): Promise<SettingItem | null> {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(input: SettingInput): Promise<SettingItem> {
    try {
      const result = await db
        .insert(settings)
        .values({
          key: input.key,
          value: input.value,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: input.value,
            updatedAt: new Date()
          }
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error(`Error setting ${input.key}:`, error);
      throw error;
    }
  }

  async getAllSettings(): Promise<SettingItem[]> {
    try {
      return await db.select().from(settings);
    } catch (error) {
      console.error('Error getting all settings:', error);
      return [];
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    try {
      const result = await db
        .delete(settings)
        .where(eq(settings.key, key));

      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error);
      return false;
    }
  }

  async getBooleanSetting(key: string, defaultValue: boolean = false): Promise<boolean> {
    const setting = await this.getSetting(key);
    if (!setting) return defaultValue;
    return setting.value === 'true';
  }

  async setBooleanSetting(key: string, value: boolean): Promise<SettingItem> {
    return await this.setSetting({ key, value: value.toString() });
  }

  async initializeDefaults(): Promise<void> {
    const defaults = {
      'cron.enabled': process.env.CRON_SERVICE_ENABLED || 'true',
      'cron.frequency': process.env.CRON_SERVICE_FREQUENCY || '*/1 * * * *'
    };

    for (const [key, value] of Object.entries(defaults)) {
      const existing = await this.getSetting(key);
      if (!existing) {
        await this.setSetting({ key, value });
      }
    }
  }
}