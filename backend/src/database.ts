import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '../data/todos.db');

let db: Database;

export async function initDatabase() {
  const SQL = await initSqlJs();

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    createTables();
    seedCategories();
    saveDatabase();
  }
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);
}

function seedCategories() {
  const categories = ['Work', 'Study', 'Personal', 'Other'];
  const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');

  categories.forEach(name => {
    stmt.run([name]);
  });

  stmt.free();
}

export function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, data);
}

export function getDatabase(): Database {
  return db;
}
