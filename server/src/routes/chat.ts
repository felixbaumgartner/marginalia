import { Router } from 'express';
import { getSupabaseClient } from '../db/connection.js';
import { streamChatCompletion } from '../services/claude.js';
import { buildSystemPrompt } from '../services/bookContext.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { conversation_id, content } = req.body;

    if (!conversation_id || !content) {
      return res.status(400).json({ error: 'conversation_id and content are required' });
    }

    const supabase = getSupabaseClient();

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .maybeSingle();

    if (convError) throw convError;
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', conversation.book_id)
      .maybeSingle();

    if (bookError) throw bookError;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        role: 'user',
        content
      });

    if (insertError) throw insertError;

    if (!conversation.title) {
      const title = content.length > 80 ? content.substring(0, 80) + '...' : content;
      await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversation_id);
    }

    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('chapter, page, content')
      .eq('book_id', book.id)
      .order('page', { ascending: true });

    if (notesError) throw notesError;

    const { data: otherBooks, error: otherBooksError } = await supabase
      .from('books')
      .select('title, author, status')
      .neq('id', book.id)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (otherBooksError) throw otherBooksError;

    const systemPrompt = buildSystemPrompt({
      title: book.title,
      author: book.author,
      description: book.description,
      currentChapter: book.current_chapter ?? null,
      currentPage: book.current_page ?? null,
      notes: notes || [],
      otherBooks: otherBooks || [],
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    for await (const token of streamChatCompletion(systemPrompt, messages || [])) {
      fullResponse += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    const { error: assistantError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        role: 'assistant',
        content: fullResponse
      });

    if (assistantError) throw assistantError;

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation_id);

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
