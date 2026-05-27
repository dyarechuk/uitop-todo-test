import { getDatabase, saveDatabase } from '../database';
import { Category } from '../types';

export class CategoryRepository {
  getAllCategories(): Category[] {
    const db = getDatabase();
    const result = db.exec('SELECT id, name FROM categories ORDER BY name');

    if (result.length === 0) return [];

    return result[0].values.map((row: any) => ({
      id: row[0] as number,
      name: row[1] as string,
    }));
  }

  getCategoryById(id: number): Category | null {
    const db = getDatabase();
    const result = db.exec('SELECT id, name FROM categories WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    return {
      id: row[0] as number,
      name: row[1] as string,
    };
  }
}
