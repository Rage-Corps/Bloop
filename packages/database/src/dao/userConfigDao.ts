import { db } from '../connection';
import { userConfig } from '../schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface UserPreferences {
  excludedCategories?: string[];
  preferredSource?: string;
}

export interface UserConfigWithPreferences {
  id: string;
  userId: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export class UserConfigDao {
  async getUserConfig(userId: string): Promise<UserConfigWithPreferences | null> {
    const config = await db
      .select()
      .from(userConfig)
      .where(eq(userConfig.userId, userId))
      .limit(1);

    if (config.length === 0) {
      return null;
    }

    return {
      ...config[0],
      preferences: config[0].preferences as UserPreferences,
    };
  }

  async createUserConfig(
    userId: string,
    preferences: UserPreferences = {}
  ): Promise<UserConfigWithPreferences> {
    const configId = randomUUID();
    
    const newConfig = await db
      .insert(userConfig)
      .values({
        id: configId,
        userId,
        preferences,
      })
      .returning();

    return {
      ...newConfig[0],
      preferences: newConfig[0].preferences as UserPreferences,
    };
  }

  async updateUserConfig(
    userId: string,
    preferences: UserPreferences
  ): Promise<UserConfigWithPreferences> {
    const updatedConfig = await db
      .update(userConfig)
      .set({
        preferences,
        updatedAt: new Date(),
      })
      .where(eq(userConfig.userId, userId))
      .returning();

    if (updatedConfig.length === 0) {
      // If no config exists, create one
      return await this.createUserConfig(userId, preferences);
    }

    return {
      ...updatedConfig[0],
      preferences: updatedConfig[0].preferences as UserPreferences,
    };
  }

  async upsertUserConfig(
    userId: string,
    preferences: UserPreferences
  ): Promise<UserConfigWithPreferences> {
    const existingConfig = await this.getUserConfig(userId);
    
    if (existingConfig) {
      // Merge with existing preferences
      const mergedPreferences = {
        ...existingConfig.preferences,
        ...preferences,
      };
      return await this.updateUserConfig(userId, mergedPreferences);
    } else {
      return await this.createUserConfig(userId, preferences);
    }
  }

  async deleteUserConfig(userId: string): Promise<boolean> {
    const result = await db
      .delete(userConfig)
      .where(eq(userConfig.userId, userId));

    return result.length > 0;
  }
}