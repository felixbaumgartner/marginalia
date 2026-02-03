import type { Book } from '@/types/book';

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex gap-4 p-4 bg-surface-raised border border-border rounded-lg hover:border-accent/50 transition-colors text-left w-full"
    >
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-16 h-24 object-cover rounded shrink-0"
        />
      ) : (
        <div className="w-16 h-24 bg-surface-overlay rounded flex items-center justify-center shrink-0">
          <span className="text-text-secondary text-xs text-center">No cover</span>
        </div>
      )}
      <div className="min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-medium text-text-primary truncate">{book.title}</p>
          <p className="text-sm text-text-secondary">{book.author}</p>
        </div>
        {book.last_message_at && (
          <p className="text-xs text-text-secondary">
            Last read: {new Date(book.last_message_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </button>
  );
}
