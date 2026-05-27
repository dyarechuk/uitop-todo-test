import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = this.categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };
}
