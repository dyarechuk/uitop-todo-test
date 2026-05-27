import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { initDatabase, getDatabase } from '../database';
import { TodoController } from '../controllers/todo.controller';
import { CategoryController } from '../controllers/category.controller';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';

let app: express.Application;

beforeAll(async () => {
  await initDatabase();

  app = express();
  app.use(cors());
  app.use(express.json());

  const todoController = new TodoController();
  const categoryController = new CategoryController();

  app.get('/categories', categoryController.getAllCategories);
  app.get('/todos', todoController.getAllTodos);
  app.post('/todos', (req, res, next) => {
    try {
      const { text, category_id } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        throw new ValidationError('Text is required and must be a non-empty string');
      }
      if (!category_id || typeof category_id !== 'number') {
        throw new ValidationError('Category ID is required and must be a number');
      }
      todoController.createTodo(req, res, next);
    } catch (error) {
      next(error);
    }
  });
  app.patch('/todos/:id', todoController.updateTodo);
  app.delete('/todos/:id', todoController.deleteTodo);
  app.use(notFoundHandler);
  app.use(errorHandler);
});

beforeEach(() => {
  const db = getDatabase();
  db.run('DELETE FROM todos');
});

describe('Backend API Tests', () => {
  describe('GET /categories', () => {
    it('should return categories', async () => {
      const response = await request(app).get('/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('POST /todos', () => {
    it('should create todo successfully', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ text: 'Test todo', category_id: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe('Test todo');
      expect(response.body.category_id).toBe(1);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 when category already has 5 active tasks', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/todos')
          .send({ text: `Task ${i}`, category_id: 1 });
      }

      const response = await request(app)
        .post('/todos')
        .send({ text: 'Task 6', category_id: 1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('maximum');
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update completed status', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ text: 'Todo to complete', category_id: 2 });

      const todoId = createResponse.body.id;

      const updateResponse = await request(app)
        .patch(`/todos/${todoId}`)
        .send({ completed: true });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.id).toBe(todoId);
      expect(updateResponse.body.completed).toBe(true);
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete todo', async () => {
      const createResponse = await request(app)
        .post('/todos')
        .send({ text: 'Todo to delete', category_id: 3 });

      const todoId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/todos/${todoId}`);

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app).get('/todos');
      const deletedTodo = getResponse.body.find((t: any) => t.id === todoId);
      expect(deletedTodo).toBeUndefined();
    });
  });
});
