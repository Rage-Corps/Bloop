import { db } from './connection.js';
import { randomUUID } from 'crypto';

export interface Category {
  id: string;
  mediaId: string;
  category: string;
}

class CategoriesDatabase {
  constructor() {
    // No seed data
  }

  // Get all categories
  getAllCategories(): Category[] {
    const stmt = db.prepare(
      'SELECT id, mediaId, category FROM categories ORDER BY created_at DESC'
    );
    return stmt.all() as Category[];
  }

  // Get category by id
  getCategoryById(id: string): Category | undefined {
    const stmt = db.prepare(
      'SELECT id, mediaId, category FROM categories WHERE id = ?'
    );
    return stmt.get(id) as Category | undefined;
  }

  // Get all categories for a specific media item
  getCategoriesByMediaId(mediaId: string): Category[] {
    const stmt = db.prepare(
      'SELECT id, mediaId, category FROM categories WHERE mediaId = ? ORDER BY created_at DESC'
    );
    return stmt.all(mediaId) as Category[];
  }

  // Get just the category names for a specific media item
  getCategoryNamesByMediaId(mediaId: string): string[] {
    const stmt = db.prepare(
      'SELECT category FROM categories WHERE mediaId = ? ORDER BY created_at DESC'
    );
    const results = stmt.all(mediaId) as { category: string }[];
    return results.map(r => r.category);
  }

  // Add new category
  addCategory(category: Category): void {
    const stmt = db.prepare(`
      INSERT INTO categories (id, mediaId, category)
      VALUES (?, ?, ?)
    `);
    stmt.run(
      category.id,
      category.mediaId,
      category.category
    );
  }

  // Add multiple categories for a media item
  addCategories(categories: string[], mediaId: string): void {
    const stmt = db.prepare(`
      INSERT INTO categories (id, mediaId, category)
      VALUES (?, ?, ?)
    `);
    
    const transaction = db.transaction(() => {
      for (const category of categories) {
        stmt.run(
          randomUUID(),
          mediaId,
          category
        );
      }
    });
    
    transaction();
  }

  // Delete category
  deleteCategory(id: string): boolean {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Delete all categories for a media item
  deleteCategoriesByMediaId(mediaId: string): number {
    const stmt = db.prepare('DELETE FROM categories WHERE mediaId = ?');
    const result = stmt.run(mediaId);
    return result.changes;
  }

  // Check if category exists
  categoryExists(id: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM categories WHERE id = ? LIMIT 1');
    return stmt.get(id) !== undefined;
  }

  // Count categories for a media item
  countCategoriesByMediaId(mediaId: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE mediaId = ?');
    const result = stmt.get(mediaId) as { count: number };
    return result.count;
  }
}

export const categoriesDatabase = new CategoriesDatabase();