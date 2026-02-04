import { Router } from 'express';
import { getDb, saveDb } from '../db/connection.js';

const router = Router();

// List notes for a book
router.get('/books/:bookId/notes', async (req, res) => {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM notes WHERE book_id = ? ORDER BY page ASC, created_at ASC');
    stmt.bind([Number(req.params.bookId)]);
    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(rows);
  } catch (error) {
    console.error('List notes error:', error);
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

// Create a note
router.post('/books/:bookId/notes', async (req, res) => {
  try {
    const db = await getDb();
    const bookId = Number(req.params.bookId);
    const { content, chapter, page } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const checkStmt = db.prepare('SELECT id FROM books WHERE id = ?');
    checkStmt.bind([bookId]);
    if (!checkStmt.step()) {
      checkStmt.free();
      return res.status(404).json({ error: 'Book not found' });
    }
    checkStmt.free();

    db.run(
      'INSERT INTO notes (book_id, chapter, page, content) VALUES (?, ?, ?, ?)',
      [bookId, chapter ?? null, page ?? null, content]
    );

    const idStmt = db.prepare('SELECT last_insert_rowid() as id');
    idStmt.step();
    const { id } = idStmt.getAsObject() as any;
    idStmt.free();

    const noteStmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    noteStmt.bind([id]);
    noteStmt.step();
    const note = noteStmt.getAsObject();
    noteStmt.free();

    saveDb();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { content, chapter, page } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const checkStmt = db.prepare('SELECT id FROM notes WHERE id = ?');
    checkStmt.bind([Number(id)]);
    if (!checkStmt.step()) {
      checkStmt.free();
      return res.status(404).json({ error: 'Note not found' });
    }
    checkStmt.free();

    db.run(
      'UPDATE notes SET content = ?, chapter = ?, page = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content, chapter ?? null, page ?? null, Number(id)]
    );

    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    stmt.bind([Number(id)]);
    stmt.step();
    const note = stmt.getAsObject();
    stmt.free();

    saveDb();
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id FROM notes WHERE id = ?');
    checkStmt.bind([Number(id)]);
    if (!checkStmt.step()) {
      checkStmt.free();
      return res.status(404).json({ error: 'Note not found' });
    }
    checkStmt.free();

    db.run('DELETE FROM notes WHERE id = ?', [Number(id)]);
    saveDb();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
