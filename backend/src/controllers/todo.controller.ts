import { Request, Response, NextFunction } from 'express';
import { TodoService } from '../services/todo.service';

export class TodoController {
  private todoService: TodoService;

  constructor() {
    this.todoService = new TodoService();
  }

  getAllTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = req.query.category
        ? parseInt(req.query.category as string)
        : undefined;

      const todos = this.todoService.getAllTodos(categoryId);
      res.json(todos);
    } catch (error) {
      next(error);
    }
  };

  getTodoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const todo = this.todoService.getTodoById(id);
      res.json(todo);
    } catch (error) {
      next(error);
    }
  };

  createTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = this.todoService.createTodo(req.body);
      res.status(201).json(todo);
    } catch (error) {
      next(error);
    }
  };

  updateTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const todo = this.todoService.updateTodo(id, req.body);
      res.json(todo);
    } catch (error) {
      next(error);
    }
  };

  deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      this.todoService.deleteTodo(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
