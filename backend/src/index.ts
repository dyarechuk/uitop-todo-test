import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { TodoController } from './controllers/todo.controller';
import { CategoryController } from './controllers/category.controller';
import { ValidationError } from './utils/errors';

const app = express();

const corsOptions = {
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

app.patch('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid todo ID');
    }

    todoController.updateTodo(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.delete('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid todo ID');
    }

    todoController.deleteTodo(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.use(notFoundHandler);

app.use(errorHandler);

async function startServer() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
