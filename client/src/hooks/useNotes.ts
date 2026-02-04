import { useState, useEffect, useCallback } from 'react';
import type { Note } from '@/types/note';
import { getBookNotes, createNote, updateNote, deleteNote } from '@/api/notes';

export function useNotes(bookId: number | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!bookId) {
      setNotes([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getBookNotes(bookId);
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (note: { content: string; chapter?: string; page?: number }) => {
    if (!bookId) return;
    const created = await createNote(bookId, note);
    setNotes(prev => [...prev, created]);
    return created;
  }, [bookId]);

  const editNote = useCallback(async (noteId: number, note: { content: string; chapter?: string; page?: number }) => {
    const updated = await updateNote(noteId, note);
    setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
    return updated;
  }, []);

  const removeNote = useCallback(async (noteId: number) => {
    await deleteNote(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  return { notes, loading, fetchNotes, addNote, editNote, removeNote };
}
