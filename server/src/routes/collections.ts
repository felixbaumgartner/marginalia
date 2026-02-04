import { Router } from 'express';
import { getDb, saveDb } from '../db/connection.js';

const router = Router();

// List collection items for a book (optionally filter by type)
router.get('/books/:bookId/collections', async (req, res) => {
  try {
    const db = await getDb();
    const bookId = Number(req.params.bookId);
    const type = req.query.type as string | undefined;

    let sql = 'SELECT * FROM collections WHERE book_id = ?';
    const params: any[] = [bookId];

    if (type && (type === 'vocabulary' || type === 'quote')) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(rows);
  } catch (error) {
    console.error('List collections error:', error);
    res.status(500).json({ error: 'Failed to list collection items' });
  }
});

// Create a collection item
router.post('/books/:bookId/collections', async (req, res) => {
  try {
    const db = await getDb();
    const bookId = Number(req.params.bookId);
    const { type, content, note, chapter, page } = req.body;

    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }
    if (type !== 'vocabulary' && type !== 'quote') {
      return res.status(400).json({ error: 'Type must be "vocabulary" or "quote"' });
    }

    const checkStmt = db.prepare('SELECT id FROM books WHERE id = ?');
    checkStmt.bind([bookId]);
    if (!checkStmt.step()) {
      checkStmt.free();
      return res.status(404).json({ error: 'Book not found' });
    }
    checkStmt.free();

    db.run(
      'INSERT INTO collections (book_id, type, content, note, chapter, page) VALUES (?, ?, ?, ?, ?, ?)',
      [bookId, type, content, note ?? null, chapter ?? null, page ?? null]
    );

    const idStmt = db.prepare('SELECT last_insert_rowid() as id');
    idStmt.step();
    const { id } = idStmt.getAsObject() as any;
    idStmt.free();

    const itemStmt = db.prepare('SELECT * FROM collections WHERE id = ?');
    itemStmt.bind([id]);
    itemStmt.step();
    const item = itemStmt.getAsObject();
    itemStmt.free();

    saveDb();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create collection item error:', error);
    res.status(500).json({ error: 'Failed to create collection item' });
  }
});

// Update a collection item
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { content, note, chapter, page } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const checkStmt = db.prepare('SELECT id FROM collections WHERE id = ?');
    checkStmt.bind([Number(id)]);
    if (!checkStmt.step()) {
      checkStmt.free();
      return res.status(404).json({ error: 'Item not found' });
    }
    checkStmt.free();

    db.run(
      'UPDATE collections SET content = ?, note = ?, chapter = ?, page = ? WHERE id = ?',
      [content, note ?? null, chapter ?? null, page ?? null, Number(id)]
    );

    const stmt = db.prepare('SELECT * FROM collections WHERE id = ?');
    stmt.bind([Number(id)]);
    stmt.step();
    const item = stmt.getAsObject();
    stmt.free();

    saveDb();
    res.json(item);
  } catch (error) {
    console.error('Update collection item error:', error);
    res.status(500).json({ error: 'Failed to update collection item' });
  }
});

// Delete a collection item
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id FROM collections WHERE id = ?');
    checkStmt.bind([Number(id)]);
    if (!checkStmt.step()) {
      checkStmt.free();
      return res.status(404).json({ error: 'Item not found' });
    }
    checkStmt.free();

    db.run('DELETE FROM collections WHERE id = ?', [Number(id)]);
    saveDb();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete collection item error:', error);
    res.status(500).json({ error: 'Failed to delete collection item' });
  }
});

export default router;
