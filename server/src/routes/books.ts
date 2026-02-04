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

// Get all currently reading books
router.get('/current', async (_req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM books WHERE is_current = 1 ORDER BY updated_at DESC');
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  res.json(rows);
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

// Add a book to currently reading
router.put('/:id/current', async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  db.run('UPDATE books SET is_current = 1, status = \'reading\', updated_at = CURRENT_TIMESTAMP, started_at = COALESCE(started_at, CURRENT_TIMESTAMP) WHERE id = ?', [Number(id)]);

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

// Remove a book from currently reading
router.put('/:id/uncurrent', async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  db.run('UPDATE books SET is_current = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Number(id)]);

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

// Update book status
router.put('/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['reading', 'finished', 'abandoned'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "reading", "finished", or "abandoned"' });
    }

    if (status === 'finished' || status === 'abandoned') {
      db.run('UPDATE books SET status = ?, finished_at = CURRENT_TIMESTAMP, is_current = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, Number(id)]);
    } else {
      db.run('UPDATE books SET status = ?, finished_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, Number(id)]);
    }

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
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get reading stats
router.get('/stats/overview', async (_req, res) => {
  try {
    const db = await getDb();

    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM books');
    totalStmt.step();
    const totalBooks = (totalStmt.getAsObject() as any).count;
    totalStmt.free();

    const readingStmt = db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'reading' OR status IS NULL");
    readingStmt.step();
    const booksReading = (readingStmt.getAsObject() as any).count;
    readingStmt.free();

    const finishedStmt = db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'finished'");
    finishedStmt.step();
    const booksFinished = (finishedStmt.getAsObject() as any).count;
    finishedStmt.free();

    const abandonedStmt = db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'abandoned'");
    abandonedStmt.step();
    const booksAbandoned = (abandonedStmt.getAsObject() as any).count;
    abandonedStmt.free();

    const convsStmt = db.prepare('SELECT COUNT(*) as count FROM conversations');
    convsStmt.step();
    const totalConversations = (convsStmt.getAsObject() as any).count;
    convsStmt.free();

    const msgsStmt = db.prepare('SELECT COUNT(*) as count FROM messages');
    msgsStmt.step();
    const totalMessages = (msgsStmt.getAsObject() as any).count;
    msgsStmt.free();

    const monthStmt = db.prepare("SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM books GROUP BY month ORDER BY month DESC LIMIT 12");
    const booksByMonth: { month: string; count: number }[] = [];
    while (monthStmt.step()) {
      const row = monthStmt.getAsObject() as any;
      booksByMonth.push({ month: row.month, count: row.count });
    }
    monthStmt.free();

    res.json({
      total_books: totalBooks,
      books_reading: booksReading,
      books_finished: booksFinished,
      books_abandoned: booksAbandoned,
      total_conversations: totalConversations,
      total_messages: totalMessages,
      books_by_month: booksByMonth.reverse(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
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

// Update reading progress
router.put('/:id/progress', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { current_chapter, current_page } = req.body;

    db.run(
      'UPDATE books SET current_chapter = ?, current_page = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [current_chapter ?? null, current_page ?? null, Number(id)]
    );

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
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
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
  db.run('DELETE FROM notes WHERE book_id = ?', [Number(id)]);
  db.run('DELETE FROM collections WHERE book_id = ?', [Number(id)]);
  db.run('DELETE FROM books WHERE id = ?', [Number(id)]);

  saveDb();
  res.json({ success: true });
});

export default router;
