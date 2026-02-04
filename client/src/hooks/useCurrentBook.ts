import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Book, BookSearchResult } from '@/types/book';
import { getCurrentBooks, saveBook, setCurrentBook, removeCurrentBook, getBookDetails, updateReadingProgress, updateBookStatus } from '@/api/books';

export function useActiveBooks() {
  const [activeBooks, setActiveBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedBook = useMemo(
    () => activeBooks.find(b => b.id === selectedBookId) ?? activeBooks[0] ?? null,
    [activeBooks, selectedBookId]
  );

  const fetchActiveBooks = useCallback(async () => {
    try {
      const books = await getCurrentBooks();
      setActiveBooks(books);
      // Auto-select first book if nothing selected or selected book no longer active
      setSelectedBookId(prev => {
        if (prev && books.some(b => b.id === prev)) return prev;
        return books[0]?.id ?? null;
      });
    } catch (err) {
      console.error('Failed to fetch active books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBooks();
  }, [fetchActiveBooks]);

  const selectBook = useCallback(async (searchResult: BookSearchResult) => {
    let description: string | null = null;
    try {
      const details = await getBookDetails(searchResult.workId);
      description = details.description;
    } catch {
      // ok without description
    }

    const saved = await saveBook({
      ol_work_id: searchResult.workId,
      ol_edition_id: searchResult.editionId,
      title: searchResult.title,
      author: searchResult.author,
      description,
      cover_url: searchResult.coverUrl,
    });

    const current = await setCurrentBook(saved.id);
    setActiveBooks(prev => {
      const exists = prev.some(b => b.id === current.id);
      return exists ? prev.map(b => b.id === current.id ? current : b) : [current, ...prev];
    });
    setSelectedBookId(current.id);
    return current;
  }, []);

  const switchBook = useCallback(async (bookId: number) => {
    const current = await setCurrentBook(bookId);
    setActiveBooks(prev => {
      const exists = prev.some(b => b.id === current.id);
      return exists ? prev.map(b => b.id === current.id ? current : b) : [current, ...prev];
    });
    setSelectedBookId(current.id);
    return current;
  }, []);

  const removeActiveBook = useCallback(async (bookId: number) => {
    await removeCurrentBook(bookId);
    setActiveBooks(prev => prev.filter(b => b.id !== bookId));
    setSelectedBookId(prev => {
      if (prev === bookId) return null; // will auto-resolve to first via useMemo
      return prev;
    });
  }, []);

  const updateProgress = useCallback(async (progress: { current_chapter?: string | null; current_page?: number | null }) => {
    if (!selectedBook) return;
    const updated = await updateReadingProgress(selectedBook.id, progress);
    setActiveBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, [selectedBook]);

  const updateStatus = useCallback(async (status: 'reading' | 'finished' | 'abandoned') => {
    if (!selectedBook) return;
    const updated = await updateBookStatus(selectedBook.id, status);
    setActiveBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, [selectedBook]);

  return {
    activeBooks,
    selectedBook,
    selectedBookId,
    setSelectedBookId,
    loading,
    selectBook,
    switchBook,
    removeActiveBook,
    updateProgress,
    updateStatus,
    refresh: fetchActiveBooks,
  };
}
