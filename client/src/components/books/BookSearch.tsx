import { useBookSearch } from '@/hooks/useBookSearch';
import { BookSearchResult } from './BookSearchResult';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { BookSearchResult as BookSearchResultType } from '@/types/book';

export function BookSearch({ onSelect }: { onSelect: (book: BookSearchResultType) => void }) {
  const { query, results, isSearching, search, clearSearch } = useBookSearch();

  const handleSelect = (book: BookSearchResultType) => {
    onSelect(book);
    clearSearch();
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search for a book by title or author..."
          className="w-full px-4 py-3 bg-surface-raised border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
          autoFocus
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-surface-raised border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {results.map((book) => (
            <BookSearchResult
              key={book.workId}
              book={book}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
