import { getDatabase, saveDatabase } from './database';
import { Todo, Category, CreateTodoRequest, UpdateTodoRequest } from './types';

export function getAllCategories(): Category[] {
  const db = getDatabase();
  const result = db.exec('SELECT id, name FROM categories ORDER BY name');

  if (result.length === 0) return [];

  return result[0].values.map((row: any) => ({
    id: row[0] as number,
    name: row[1] as string
  }));
}

function normalizeDate(sqliteDate: string): string {
  return sqliteDate.replace(' ', 'T') + 'Z';
}

export function getAllTodos(categoryId?: number): Todo[] {
  const db = getDatabase();
  let query = `
    SELECT t.id, t.text, t.category_id, c.name as category_name, t.completed, t.created_at
    FROM todos t
    JOIN categories c ON t.category_id = c.id
  `;

  const params: any[] = [];
  if (categoryId !== undefined) {
    query += ' WHERE t.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY t.created_at DESC';

  const result = db.exec(query, params);

  if (result.length === 0) return [];

  return result[0].values.map((row: any) => ({
    id: row[0] as number,
    text: row[1] as string,
    category_id: row[2] as number,
    category_name: row[3] as string,
    completed: Boolean(row[4]),
    created_at: normalizeDate(row[5] as string)
  }));
}

export function createTodo(data: CreateTodoRequest): Todo {
  const db = getDatabase();

  const activeCount = db.exec(
    'SELECT COUNT(*) as count FROM todos WHERE category_id = ? AND completed = 0',
    [data.category_id]
  );

  const count = activeCount[0]?.values[0]?.[0] as number || 0;

  if (count >= 5) {
    throw new Error('Category has reached maximum of 5 active tasks');
  }

  db.run(
    'INSERT INTO todos (text, category_id) VALUES (?, ?)',
    [data.text, data.category_id]
  );

  saveDatabase();

  const result = db.exec('SELECT last_insert_rowid()');
  const id = result[0].values[0][0] as number;

  const todos = getAllTodos();
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    throw new Error('Failed to retrieve created todo');
  }
  return todo;
}

export function updateTodo(id: number, data: UpdateTodoRequest): Todo | null {
  const db = getDatabase();

  const existing = db.exec('SELECT * FROM todos WHERE id = ?', [id]);
  if (existing.length === 0) return null;

  if (data.category_id !== undefined && data.category_id !== existing[0].values[0][2]) {
    const activeCount = db.exec(
      'SELECT COUNT(*) as count FROM todos WHERE category_id = ? AND completed = 0 AND id != ?',
      [data.category_id, id]
    );

    const count = activeCount[0]?.values[0]?.[0] as number || 0;

    if (count >= 5 && !data.completed) {
      throw new Error('Category has reached maximum of 5 active tasks');
    }
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.text !== undefined) {
    updates.push('text = ?');
    params.push(data.text);
  }

  if (data.category_id !== undefined) {
    updates.push('category_id = ?');
    params.push(data.category_id);
  }

  if (data.completed !== undefined) {
    updates.push('completed = ?');
    params.push(data.completed ? 1 : 0);
  }

  if (updates.length === 0) return null;

  params.push(id);

  db.run(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  saveDatabase();

  const todos = getAllTodos();
  return todos.find(t => t.id === id) || null;
}

export function deleteTodo(id: number): boolean {
  const db = getDatabase();

  const existing = db.exec('SELECT * FROM todos WHERE id = ?', [id]);
  if (existing.length === 0) return false;

  db.run('DELETE FROM todos WHERE id = ?', [id]);
  saveDatabase();

  return true;
}
