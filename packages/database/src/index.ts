// Export database connection and schema
export { db, client } from './connection';
export * from './schema';

// Export all DAOs
export { MediaDao } from './dao/mediaDao';
export { CategoryDao } from './dao/categoryDao';
export { SourceDao } from './dao/sourceDao';
export { SettingsDao } from './dao/settingsDao';
export { UserConfigDao } from './dao/userConfigDao';

// Re-export types that are commonly used with DAOs
export type {
  CreateMediaInput,
  UpdateMediaInput,
  MediaWithDetails
} from './dao/mediaDao';

export type {
  UserPreferences,
  UserConfigWithPreferences
} from './dao/userConfigDao';

export type {
  SettingInput,
  SettingItem
} from './dao/settingsDao';