import { Router } from 'express';
import { getSupabaseClient } from '../db/connection.js';
import { searchBooks, getBookDetails } from '../services/openLibrary.js';

const router = Router();

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

router.get('/details/:workId', async (req, res) => {
  try {
    const details = await getBookDetails(req.params.workId);
    res.json(details);
  } catch (error) {
    console.error('Details error:', error);
    res.status(500).json({ error: 'Failed to get book details' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        conversations (
          id,
          messages (
            created_at
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const booksWithLastMessage = data?.map(book => {
      const allMessages = book.conversations?.flatMap((c: any) => c.messages || []) || [];
      const lastMessage = allMessages.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const { conversations, ...bookData } = book;
      return {
        ...bookData,
        last_message_at: lastMessage?.created_at || null
      };
    }) || [];

    res.json(booksWithLastMessage);
  } catch (error) {
    console.error('List books error:', error);
    res.status(500).json({ error: 'Failed to list books' });
  }
});

router.get('/current', async (_req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_current', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get current books error:', error);
    res.status(500).json({ error: 'Failed to get current books' });
  }
});

router.post('/', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { ol_work_id, ol_edition_id, title, author, description, cover_url } = req.body;

    const { data: existing, error: checkError } = await supabase
      .from('books')
      .select('*')
      .eq('ol_work_id', ol_work_id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) return res.json(existing);

    const { data, error } = await supabase
      .from('books')
      .insert({
        ol_work_id,
        ol_edition_id,
        title,
        author,
        description,
        cover_url
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Save book error:', error);
    res.status(500).json({ error: 'Failed to save book' });
  }
});

router.put('/:id/current', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    const { data, error } = await supabase
      .from('books')
      .update({
        is_current: true,
        status: 'reading',
        updated_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Book not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Set current book error:', error);
    res.status(500).json({ error: 'Failed to set current book' });
  }
});

router.put('/:id/uncurrent', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    const { data, error } = await supabase
      .from('books')
      .update({
        is_current: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Book not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Unset current book error:', error);
    res.status(500).json({ error: 'Failed to unset current book' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['reading', 'finished', 'abandoned'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "reading", "finished", or "abandoned"' });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'finished' || status === 'abandoned') {
      updateData.finished_at = new Date().toISOString();
      updateData.is_current = false;
    } else {
      updateData.finished_at = null;
    }

    const { data, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Book not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/stats/overview', async (_req, res) => {
  try {
    const supabase = getSupabaseClient();

    const { count: totalBooks, error: totalError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { count: booksReading, error: readingError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'reading');

    if (readingError) throw readingError;

    const { count: booksFinished, error: finishedError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'finished');

    if (finishedError) throw finishedError;

    const { count: booksAbandoned, error: abandonedError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'abandoned');

    if (abandonedError) throw abandonedError;

    const { count: totalConversations, error: convsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (convsError) throw convsError;

    const { count: totalMessages, error: msgsError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (msgsError) throw msgsError;

    const { data: booksByMonthData, error: monthError } = await supabase
      .rpc('get_books_by_month');

    let booksByMonth: { month: string; count: number }[] = [];
    if (!monthError && booksByMonthData) {
      booksByMonth = booksByMonthData;
    }

    res.json({
      total_books: totalBooks || 0,
      books_reading: booksReading || 0,
      books_finished: booksFinished || 0,
      books_abandoned: booksAbandoned || 0,
      total_conversations: totalConversations || 0,
      total_messages: totalMessages || 0,
      books_by_month: booksByMonth,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/:bookId/conversations', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('book_id', req.params.bookId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

router.post('/:bookId/conversations', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { bookId } = req.params;

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .maybeSingle();

    if (bookError) throw bookError;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ book_id: bookId })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { current_chapter, current_page } = req.body;

    const { data, error } = await supabase
      .from('books')
      .update({
        current_chapter: current_chapter ?? null,
        current_page: current_page ?? null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Book not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    const { data: book, error: checkError } = await supabase
      .from('books')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;
