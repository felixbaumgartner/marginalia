import { getDb, saveDb } from './connection.js';

function getColumnNames(db: any, table: string): string[] {
  const result = db.exec(`PRAGMA table_info(${table})`);
  if (!result.length) return [];
  return result[0].values.map((row: any[]) => row[1] as string);
}

function migrateSchema(db: any): void {
  const bookColumns = getColumnNames(db, 'books');

  if (!bookColumns.includes('current_chapter')) {
    db.run('ALTER TABLE books ADD COLUMN current_chapter TEXT');
  }
  if (!bookColumns.includes('current_page')) {
    db.run('ALTER TABLE books ADD COLUMN current_page INTEGER');
  }
  if (!bookColumns.includes('status')) {
    db.run("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'reading'");
  }
  if (!bookColumns.includes('started_at')) {
    db.run('ALTER TABLE books ADD COLUMN started_at TEXT');
    db.run('UPDATE books SET started_at = created_at WHERE started_at IS NULL');
  }
  if (!bookColumns.includes('finished_at')) {
    db.run('ALTER TABLE books ADD COLUMN finished_at TEXT');
  }
}

export async function initializeDatabase(): Promise<void> {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ol_work_id TEXT UNIQUE,
      ol_edition_id TEXT,
      title TEXT NOT NULL,
      author TEXT,
      description TEXT,
      cover_url TEXT,
      is_current INTEGER DEFAULT 0,
      current_chapter TEXT,
      current_page INTEGER,
      status TEXT DEFAULT 'reading',
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      title TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter TEXT,
      page INTEGER,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('vocabulary', 'quote')),
      content TEXT NOT NULL,
      note TEXT,
      chapter TEXT,
      page INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_conversations_book_id ON conversations(book_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_collections_book_id ON collections(book_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type)');

  migrateSchema(db);

  saveDb();
}
