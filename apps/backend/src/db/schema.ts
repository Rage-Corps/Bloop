import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  pageUrl: text('page_url').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})

export const sources = pgTable('sources', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  sourceName: text('source_name').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})