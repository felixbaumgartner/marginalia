import type { Book } from '@/types/book';

const statusColors: Record<string, string> = {
  reading: 'bg-green-500/10 text-green-400',
  finished: 'bg-blue-500/10 text-blue-400',
  abandoned: 'bg-red-500/10 text-red-400',
};

export function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const status = book.status ?? 'reading';

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
      <div className="min-w-0 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-text-primary truncate">{book.title}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[status]}`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{book.author}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {book.last_message_at && (
            <span>Last read: {new Date(book.last_message_at).toLocaleDateString()}</span>
          )}
          {book.started_at && (
            <span>Started: {new Date(book.started_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </button>
  );
}
