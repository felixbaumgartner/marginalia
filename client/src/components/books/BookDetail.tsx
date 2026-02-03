import type { Book } from '@/types/book';

export function BookDetail({ book }: { book: Book }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-surface-raised border border-border rounded-lg">
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-32 h-48 object-cover rounded shadow-lg shrink-0 self-center sm:self-start"
        />
      ) : (
        <div className="w-32 h-48 bg-surface-overlay rounded flex items-center justify-center shrink-0 self-center sm:self-start">
          <span className="text-text-secondary">No cover</span>
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-text-primary">{book.title}</h2>
        <p className="text-text-secondary mt-1">{book.author}</p>
        {book.description && (
          <p className="text-sm text-text-secondary mt-3 line-clamp-4">{book.description}</p>
        )}
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
            Currently reading
          </span>
        </div>
      </div>
    </div>
  );
}
