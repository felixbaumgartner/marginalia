import { BookSearch } from '@/components/books/BookSearch';
import { BookDetail } from '@/components/books/BookDetail';
import type { Book, BookSearchResult } from '@/types/book';

export function HomePage({ currentBook, onSelectBook }: {
  currentBook: Book | null;
  onSelectBook: (book: BookSearchResult) => Promise<void>;
}) {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            {currentBook ? 'Switch books' : 'Find a book'}
          </h2>
          <p className="text-text-secondary">
            Search for a book to start asking questions about it.
          </p>
        </div>

        <div className="mb-8">
          <BookSearch onSelect={onSelectBook} />
        </div>

        {currentBook && (
          <div>
            <BookDetail book={currentBook} />
          </div>
        )}
      </div>
    </div>
  );
}
