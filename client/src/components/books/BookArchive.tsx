import { useState, useEffect } from 'react';
import type { Book } from '@/types/book';
import { getAllBooks } from '@/api/books';
import { BookCard } from './BookCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function BookArchive({ onSelectBook }: { onSelectBook: (book: Book) => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No books yet"
        description="Search for a book to start your reading journey."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={() => onSelectBook(book)} />
      ))}
    </div>
  );
}
