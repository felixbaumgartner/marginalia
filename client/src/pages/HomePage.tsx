import { BookSearch } from '@/components/books/BookSearch';
import { BookDetail } from '@/components/books/BookDetail';
import type { Book, BookSearchResult } from '@/types/book';

export function HomePage({ selectedBook, activeBooks, onSelectBook, onUpdateProgress, onUpdateStatus }: {
  selectedBook: Book | null;
  activeBooks: Book[];
  onSelectBook: (book: BookSearchResult) => Promise<void>;
  onUpdateProgress: (progress: { current_chapter?: string | null; current_page?: number | null }) => Promise<void>;
  onUpdateStatus: (status: 'reading' | 'finished' | 'abandoned') => Promise<void>;
}) {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            {activeBooks.length > 0 ? 'Add another book' : 'Find a book'}
          </h2>
          <p className="text-text-secondary">
            Search for a book to start asking questions about it.
          </p>
        </div>

        <div className="mb-8">
          <BookSearch onSelect={onSelectBook} />
        </div>

        {selectedBook && (
          <div>
            <BookDetail book={selectedBook} onUpdateProgress={onUpdateProgress} onUpdateStatus={onUpdateStatus} />
          </div>
        )}
      </div>
    </div>
  );
}
