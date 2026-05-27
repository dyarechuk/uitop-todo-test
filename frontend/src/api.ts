import axios, { AxiosError } from 'axios';
import type { Todo, Category, CreateTodoRequest, UpdateTodoRequest } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getTodos: async (categoryId?: number): Promise<Todo[]> => {
    const params = categoryId ? { category: categoryId } : {};
    const response = await apiClient.get('/todos', { params });
    return response.data;
  },

  createTodo: async (data: CreateTodoRequest): Promise<Todo> => {
    const response = await apiClient.post('/todos', data);
    return response.data;
  },

  updateTodo: async (id: number, data: UpdateTodoRequest): Promise<Todo> => {
    const response = await apiClient.patch(`/todos/${id}`, data);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },
};
