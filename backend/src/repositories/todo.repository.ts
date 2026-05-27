import { getDatabase, saveDatabase } from '../database';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';

function normalizeDate(sqliteDate: string): string {
  return sqliteDate.replace(' ', 'T') + 'Z';
}

export class TodoRepository {
  getAllTodos(categoryId?: number): Todo[] {
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
      created_at: normalizeDate(row[5] as string),
    }));
  }

  getTodoById(id: number): Todo | null {
    const todos = this.getAllTodos();
    return todos.find((t) => t.id === id) || null;
  }

  getActiveTodoCountByCategory(categoryId: number, excludeId?: number): number {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM todos WHERE category_id = ? AND completed = 0';
    const params: any[] = [categoryId];

    if (excludeId !== undefined) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = db.exec(query, params);
    return (result[0]?.values[0]?.[0] as number) || 0;
  }

  createTodo(data: CreateTodoRequest): number {
    const db = getDatabase();

    db.run('INSERT INTO todos (text, category_id) VALUES (?, ?)', [
      data.text,
      data.category_id,
    ]);

    saveDatabase();

    const result = db.exec('SELECT MAX(id) FROM todos');
    return result[0].values[0][0] as number;
  }

  updateTodo(id: number, data: UpdateTodoRequest): boolean {
    const db = getDatabase();

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

    if (updates.length === 0) return false;

    params.push(id);

    db.run(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`, params);

    saveDatabase();

    return true;
  }

  deleteTodo(id: number): boolean {
    const db = getDatabase();

    const existing = db.exec('SELECT * FROM todos WHERE id = ?', [id]);
    if (existing.length === 0) return false;

    db.run('DELETE FROM todos WHERE id = ?', [id]);
    saveDatabase();

    return true;
  }

  todoExists(id: number): boolean {
    const db = getDatabase();
    const result = db.exec('SELECT 1 FROM todos WHERE id = ?', [id]);
    return result.length > 0 && result[0].values.length > 0;
  }
}
