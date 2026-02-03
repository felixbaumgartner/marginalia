import { Router } from 'express';
import { getDb, saveDb } from '../db/connection.js';

const router = Router();

// Get a conversation with all its messages
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const convStmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
  convStmt.bind([Number(req.params.id)]);
  if (!convStmt.step()) {
    convStmt.free();
    return res.status(404).json({ error: 'Conversation not found' });
  }
  const conversation = convStmt.getAsObject();
  convStmt.free();

  const msgStmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC');
  msgStmt.bind([Number(req.params.id)]);
  const messages: any[] = [];
  while (msgStmt.step()) {
    messages.push(msgStmt.getAsObject());
  }
  msgStmt.free();

  res.json({ ...conversation, messages });
});

// Delete a conversation
router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const id = Number(req.params.id);

  const checkStmt = db.prepare('SELECT id FROM conversations WHERE id = ?');
  checkStmt.bind([id]);
  if (!checkStmt.step()) {
    checkStmt.free();
    return res.status(404).json({ error: 'Conversation not found' });
  }
  checkStmt.free();

  db.run('DELETE FROM messages WHERE conversation_id = ?', [id]);
  db.run('DELETE FROM conversations WHERE id = ?', [id]);

  saveDb();
  res.json({ success: true });
});

export default router;
