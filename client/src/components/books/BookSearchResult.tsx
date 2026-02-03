import type { BookSearchResult as BookSearchResultType } from '@/types/book';

export function BookSearchResult({ book, onSelect }: {
  book: BookSearchResultType;
  onSelect: (book: BookSearchResultType) => void;
}) {
  return (
    <button
      onClick={() => onSelect(book)}
      className="w-full flex items-center gap-3 p-3 hover:bg-surface-overlay transition-colors text-left border-b border-border last:border-b-0"
    >
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-10 h-14 object-cover rounded shrink-0"
        />
      ) : (
        <div className="w-10 h-14 bg-surface-overlay rounded flex items-center justify-center shrink-0">
          <span className="text-text-secondary text-xs">No cover</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{book.title}</p>
        <p className="text-xs text-text-secondary truncate">
          {book.author}
          {book.publishYear && ` (${book.publishYear})`}
        </p>
      </div>
    </button>
  );
}
