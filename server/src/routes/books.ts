import { Router } from 'express';
import { getDb, saveDb } from '../db/connection.js';
import { searchBooks, getBookDetails } from '../services/openLibrary.js';

const router = Router();

// Search Open Library
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const results = await searchBooks(query);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// Get book details from Open Library
router.get('/details/:workId', async (req, res) => {
  try {
    const details = await getBookDetails(req.params.workId);
    res.json(details);
  } catch (error) {
    console.error('Details error:', error);
    res.status(500).json({ error: 'Failed to get book details' });
  }
});

// List all saved books with last message date
router.get('/', async (_req, res) => {
  const db = await getDb();
  const stmt = db.prepare(`
    SELECT b.*,
      (SELECT MAX(m.created_at) FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.book_id = b.id) as last_message_at
    FROM books b
    ORDER BY b.updated_at DESC
  `);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  res.json(rows);
});

// Get currently reading book
router.get('/current', async (_req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM books WHERE is_current = 1');
  const book = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  res.json(book);
});

// Save a new book
router.post('/', async (req, res) => {
  const db = await getDb();
  const { ol_work_id, ol_edition_id, title, author, description, cover_url } = req.body;

  const checkStmt = db.prepare('SELECT * FROM books WHERE ol_work_id = ?');
  checkStmt.bind([ol_work_id]);
  if (checkStmt.step()) {
    const existing = checkStmt.getAsObject();
    checkStmt.free();
    return res.json(existing);
  }
  checkStmt.free();

  db.run('INSERT INTO books (ol_work_id, ol_edition_id, title, author, description, cover_url) VALUES (?, ?, ?, ?, ?, ?)',
    [ol_work_id, ol_edition_id, title, author, description, cover_url]);

  const idStmt = db.prepare('SELECT last_insert_rowid() as id');
  idStmt.step();
  const { id } = idStmt.getAsObject() as any;
  idStmt.free();

  const bookStmt = db.prepare('SELECT * FROM books WHERE id = ?');
  bookStmt.bind([id]);
  bookStmt.step();
  const book = bookStmt.getAsObject();
  bookStmt.free();

  saveDb();
  res.status(201).json(book);
});

// Set a book as currently reading
router.put('/:id/current', async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  db.run('UPDATE books SET is_current = 0 WHERE is_current = 1');
  db.run('UPDATE books SET is_current = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Number(id)]);

  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  stmt.bind([Number(id)]);
  if (!stmt.step()) {
    stmt.free();
    return res.status(404).json({ error: 'Book not found' });
  }
  const book = stmt.getAsObject();
  stmt.free();

  saveDb();
  res.json(book);
});

// List conversations for a book
router.get('/:bookId/conversations', async (req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM conversations WHERE book_id = ? ORDER BY updated_at DESC');
  stmt.bind([Number(req.params.bookId)]);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  res.json(rows);
});

// Create a new conversation for a book
router.post('/:bookId/conversations', async (req, res) => {
  const db = await getDb();
  const bookId = Number(req.params.bookId);

  const checkStmt = db.prepare('SELECT * FROM books WHERE id = ?');
  checkStmt.bind([bookId]);
  if (!checkStmt.step()) {
    checkStmt.free();
    return res.status(404).json({ error: 'Book not found' });
  }
  checkStmt.free();

  db.run('INSERT INTO conversations (book_id) VALUES (?)', [bookId]);

  const idStmt = db.prepare('SELECT last_insert_rowid() as id');
  idStmt.step();
  const { id } = idStmt.getAsObject() as any;
  idStmt.free();

  const convStmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
  convStmt.bind([id]);
  convStmt.step();
  const conversation = convStmt.getAsObject();
  convStmt.free();

  saveDb();
  res.status(201).json(conversation);
});

// Delete a book and its conversations
router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  // Check if book exists first
  const checkStmt = db.prepare('SELECT id FROM books WHERE id = ?');
  checkStmt.bind([Number(id)]);
  if (!checkStmt.step()) {
    checkStmt.free();
    return res.status(404).json({ error: 'Book not found' });
  }
  checkStmt.free();

  // Delete conversations and their messages first (CASCADE may not work with sql.js)
  const convStmt = db.prepare('SELECT id FROM conversations WHERE book_id = ?');
  convStmt.bind([Number(id)]);
  const convIds: number[] = [];
  while (convStmt.step()) {
    convIds.push((convStmt.getAsObject() as any).id);
  }
  convStmt.free();

  for (const convId of convIds) {
    db.run('DELETE FROM messages WHERE conversation_id = ?', [convId]);
  }
  db.run('DELETE FROM conversations WHERE book_id = ?', [Number(id)]);
  db.run('DELETE FROM books WHERE id = ?', [Number(id)]);

  saveDb();
  res.json({ success: true });
});

export default router;
