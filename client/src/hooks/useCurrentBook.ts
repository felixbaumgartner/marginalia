import { useState, useEffect, useCallback } from 'react';
import type { Book, BookSearchResult } from '@/types/book';
import { getCurrentBook, saveBook, setCurrentBook, getBookDetails, updateReadingProgress } from '@/api/books';

export function useCurrentBook() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrent = useCallback(async () => {
    try {
      const current = await getCurrentBook();
      setBook(current);
    } catch (err) {
      console.error('Failed to fetch current book:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  const selectBook = useCallback(async (searchResult: BookSearchResult) => {
    // Fetch description
    let description: string | null = null;
    try {
      const details = await getBookDetails(searchResult.workId);
      description = details.description;
    } catch {
      // ok without description
    }

    // Save book
    const saved = await saveBook({
      ol_work_id: searchResult.workId,
      ol_edition_id: searchResult.editionId,
      title: searchResult.title,
      author: searchResult.author,
      description,
      cover_url: searchResult.coverUrl,
    });

    // Set as current
    const current = await setCurrentBook(saved.id);
    setBook(current);
    return current;
  }, []);

  const switchBook = useCallback(async (bookId: number) => {
    const current = await setCurrentBook(bookId);
    setBook(current);
    return current;
  }, []);

  const updateProgress = useCallback(async (progress: { current_chapter?: string | null; current_page?: number | null }) => {
    if (!book) return;
    const updated = await updateReadingProgress(book.id, progress);
    setBook(updated);
  }, [book]);

  return { book, loading, selectBook, switchBook, updateProgress, refresh: fetchCurrent };
}
