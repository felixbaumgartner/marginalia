import { Router } from 'express';
import { getDb, saveDb } from '../db/connection.js';
import { streamChatCompletion } from '../services/claude.js';
import { buildSystemPrompt } from '../services/bookContext.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { conversation_id, content } = req.body;

    if (!conversation_id || !content) {
      return res.status(400).json({ error: 'conversation_id and content are required' });
    }

    const db = await getDb();

    // Look up conversation
    const convStmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    convStmt.bind([Number(conversation_id)]);
    if (!convStmt.step()) {
      convStmt.free();
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const conversation = convStmt.getAsObject() as any;
    convStmt.free();

    // Look up book
    const bookStmt = db.prepare('SELECT * FROM books WHERE id = ?');
    bookStmt.bind([conversation.book_id]);
    if (!bookStmt.step()) {
      bookStmt.free();
      return res.status(404).json({ error: 'Book not found' });
    }
    const book = bookStmt.getAsObject() as any;
    bookStmt.free();

    // Save user message
    db.run('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [Number(conversation_id), 'user', content]);

    // Update conversation title from first message if not set
    if (!conversation.title) {
      const title = content.length > 80 ? content.substring(0, 80) + '...' : content;
      db.run('UPDATE conversations SET title = ? WHERE id = ?', [title, Number(conversation_id)]);
    }

    // Get all messages for context
    const msgStmt = db.prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC');
    msgStmt.bind([Number(conversation_id)]);
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    while (msgStmt.step()) {
      const row = msgStmt.getAsObject() as any;
      messages.push({ role: row.role, content: row.content });
    }
    msgStmt.free();

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      title: book.title,
      author: book.author,
      description: book.description,
    });

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    for await (const token of streamChatCompletion(systemPrompt, messages)) {
      fullResponse += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    // Save assistant message
    db.run('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [Number(conversation_id), 'assistant', fullResponse]);

    // Update conversation timestamp
    db.run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Number(conversation_id)]);

    saveDb();

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
});

export default router;
