import { db } from '../db/connection';
import { categories } from '../db/schema';

export class CategoryDao {
  async getUniqueCategories(): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: categories.category })
      .from(categories)
      .orderBy(categories.category);

    return result.map((item) => item.category);
  }
}
