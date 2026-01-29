const db = require('./database');

const initTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('developer', 'user')) DEFAULT 'user',
      is_active INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Articles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_no TEXT UNIQUE NOT NULL,
      season TEXT NOT NULL,
      size TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      fabric_type TEXT NOT NULL,
      total_cost REAL DEFAULT 0,
      sales_rate REAL NOT NULL,
      profit_margin REAL DEFAULT 0,
      quantity INTEGER NOT NULL,
      image TEXT,
      created_by INTEGER NOT NULL,
      updated_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    )
  `);

  // Rates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )
  `);

  // Options table - COLUMN NAME CHANGED
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      option_key TEXT UNIQUE NOT NULL,
      option_values TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ All tables created');
};

module.exports = { initTables };