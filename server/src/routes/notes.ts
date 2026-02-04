import { Router } from 'express';
import { getSupabaseClient } from '../db/connection.js';

const router = Router();

router.get('/books/:bookId/notes', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('book_id', req.params.bookId)
      .order('page', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('List notes error:', error);
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

router.post('/books/:bookId/notes', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const bookId = req.params.bookId;
    const { content, chapter, page } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: book, error: checkError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        book_id: bookId,
        chapter: chapter ?? null,
        page: page ?? null,
        content
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { content, chapter, page } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: note, error: checkError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        content,
        chapter: chapter ?? null,
        page: page ?? null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    const { data: note, error: checkError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
