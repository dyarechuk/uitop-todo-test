export interface Todo {
  id: number;
  text: string;
  category_id: number;
  category_name?: string;
  completed: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CreateTodoRequest {
  text: string;
  category_id: number;
}

export interface UpdateTodoRequest {
  text?: string;
  category_id?: number;
  completed?: boolean;
}
