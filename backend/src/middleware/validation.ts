import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export function validateCreateTodo(req: Request, res: Response, next: NextFunction) {
  const { text, category_id } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new ValidationError('Text is required and must be a non-empty string');
  }

  if (text.trim().length > 500) {
    throw new ValidationError('Text must not exceed 500 characters');
  }

  if (!category_id || typeof category_id !== 'number') {
    throw new ValidationError('Category ID is required and must be a number');
  }

  if (category_id < 1) {
    throw new ValidationError('Category ID must be a positive number');
  }

  next();
}

export function validateUpdateTodo(req: Request, res: Response, next: NextFunction) {
  const { text, category_id, completed } = req.body;

  if (text !== undefined) {
    if (typeof text !== 'string' || !text.trim()) {
      throw new ValidationError('Text must be a non-empty string');
    }
    if (text.trim().length > 500) {
      throw new ValidationError('Text must not exceed 500 characters');
    }
  }

  if (category_id !== undefined) {
    if (typeof category_id !== 'number' || category_id < 1) {
      throw new ValidationError('Category ID must be a positive number');
    }
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    throw new ValidationError('Completed must be a boolean');
  }

  if (Object.keys(req.body).length === 0) {
    throw new ValidationError('At least one field must be provided for update');
  }

  next();
}

export function validateTodoId(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError('Invalid todo ID');
  }

  req.params.id = id.toString();
  next();
}
