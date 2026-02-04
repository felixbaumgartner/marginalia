import { Router } from 'express';
import { getSupabaseClient } from '../db/connection.js';

const router = Router();

router.get('/books/:bookId/collections', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const bookId = req.params.bookId;
    const type = req.query.type as string | undefined;

    let query = supabase
      .from('collections')
      .select('*')
      .eq('book_id', bookId);

    if (type && (type === 'vocabulary' || type === 'quote')) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('List collections error:', error);
    res.status(500).json({ error: 'Failed to list collection items' });
  }
});

router.post('/books/:bookId/collections', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const bookId = req.params.bookId;
    const { type, content, note, chapter, page } = req.body;

    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }
    if (type !== 'vocabulary' && type !== 'quote') {
      return res.status(400).json({ error: 'Type must be "vocabulary" or "quote"' });
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
      .from('collections')
      .insert({
        book_id: bookId,
        type,
        content,
        note: note ?? null,
        chapter: chapter ?? null,
        page: page ?? null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create collection item error:', error);
    res.status(500).json({ error: 'Failed to create collection item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { content, note, chapter, page } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: item, error: checkError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { data, error } = await supabase
      .from('collections')
      .update({
        content,
        note: note ?? null,
        chapter: chapter ?? null,
        page: page ?? null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update collection item error:', error);
    res.status(500).json({ error: 'Failed to update collection item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    const { data: item, error: checkError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete collection item error:', error);
    res.status(500).json({ error: 'Failed to delete collection item' });
  }
});

export default router;
