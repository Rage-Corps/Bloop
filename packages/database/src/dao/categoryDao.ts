import { db } from '../connection';
import { categories } from '../schema';

export class CategoryDao {
  async getUniqueCategories(): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: categories.category })
      .from(categories)
      .orderBy(categories.category);

    return result.map((item) => item.category);
  }
}
