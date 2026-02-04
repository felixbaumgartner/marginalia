import { Router } from 'express';
import { getSupabaseClient } from '../db/connection.js';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (convError) throw convError;
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    res.json({ ...conversation, messages: messages || [] });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
