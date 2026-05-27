import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../types';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  getAllCategories(): Category[] {
    return this.categoryRepository.getAllCategories();
  }

  getCategoryById(id: number): Category | null {
    return this.categoryRepository.getCategoryById(id);
  }
}
