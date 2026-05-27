import { TodoRepository } from '../repositories/todo.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';
import { NotFoundError, BusinessRuleError } from '../utils/errors';
import { config } from '../config/env';

export class TodoService {
  private todoRepository: TodoRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.todoRepository = new TodoRepository();
    this.categoryRepository = new CategoryRepository();
  }

  getAllTodos(categoryId?: number): Todo[] {
    if (categoryId !== undefined) {
      const category = this.categoryRepository.getCategoryById(categoryId);
      if (!category) {
        throw new NotFoundError(`Category with ID ${categoryId} not found`);
      }
    }

    return this.todoRepository.getAllTodos(categoryId);
  }

  getTodoById(id: number): Todo {
    const todo = this.todoRepository.getTodoById(id);
    if (!todo) {
      throw new NotFoundError(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  createTodo(data: CreateTodoRequest): Todo {
    const category = this.categoryRepository.getCategoryById(data.category_id);
    if (!category) {
      throw new NotFoundError(`Category with ID ${data.category_id} not found`);
    }

    const activeCount = this.todoRepository.getActiveTodoCountByCategory(data.category_id);
    if (activeCount >= config.maxTasksPerCategory) {
      throw new BusinessRuleError(
        `Category has reached maximum of ${config.maxTasksPerCategory} active tasks`
      );
    }

    const id = this.todoRepository.createTodo({
      text: data.text.trim(),
      category_id: data.category_id,
    });

    return this.getTodoById(id);
  }

  updateTodo(id: number, data: UpdateTodoRequest): Todo {
    if (!this.todoRepository.todoExists(id)) {
      throw new NotFoundError(`Todo with ID ${id} not found`);
    }

    if (data.category_id !== undefined) {
      const category = this.categoryRepository.getCategoryById(data.category_id);
      if (!category) {
        throw new NotFoundError(`Category with ID ${data.category_id} not found`);
      }

      const currentTodo = this.todoRepository.getTodoById(id);
      if (currentTodo && currentTodo.category_id !== data.category_id) {
        const activeCount = this.todoRepository.getActiveTodoCountByCategory(
          data.category_id,
          id
        );

        if (data.completed !== true && activeCount >= config.maxTasksPerCategory) {
          throw new BusinessRuleError(
            `Category has reached maximum of ${config.maxTasksPerCategory} active tasks`
          );
        }
      }
    }

    const updateData = { ...data };
    if (updateData.text !== undefined) {
      updateData.text = updateData.text.trim();
    }

    this.todoRepository.updateTodo(id, updateData);

    return this.getTodoById(id);
  }

  deleteTodo(id: number): void {
    const deleted = this.todoRepository.deleteTodo(id);
    if (!deleted) {
      throw new NotFoundError(`Todo with ID ${id} not found`);
    }
  }
}
