import { useState, useEffect } from 'react';
import type { Book } from '@/types/book';
import { CollectionSection } from '@/components/collections/CollectionSection';

const statusOptions = [
  { value: 'reading', label: 'Reading', color: 'bg-green-500/10 text-green-400' },
  { value: 'finished', label: 'Finished', color: 'bg-blue-500/10 text-blue-400' },
  { value: 'abandoned', label: 'Abandoned', color: 'bg-red-500/10 text-red-400' },
];

interface BookDetailProps {
  book: Book;
  onUpdateProgress?: (progress: { current_chapter?: string | null; current_page?: number | null }) => Promise<void>;
  onUpdateStatus?: (status: 'reading' | 'finished' | 'abandoned') => Promise<void>;
}

export function BookDetail({ book, onUpdateProgress, onUpdateStatus }: BookDetailProps) {
  const [chapter, setChapter] = useState(book.current_chapter ?? '');
  const [page, setPage] = useState(book.current_page?.toString() ?? '');
  const status = book.status ?? 'reading';

  useEffect(() => {
    setChapter(book.current_chapter ?? '');
    setPage(book.current_page?.toString() ?? '');
  }, [book.id, book.current_chapter, book.current_page]);

  const handleProgressBlur = () => {
    if (!onUpdateProgress) return;
    const newChapter = chapter.trim() || null;
    const newPage = page.trim() ? Math.max(1, Number(page)) : null;
    if (newChapter !== (book.current_chapter ?? null) || newPage !== (book.current_page ?? null)) {
      onUpdateProgress({ current_chapter: newChapter, current_page: newPage });
    }
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLElement).blur();
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onUpdateStatus) {
      await onUpdateStatus(e.target.value as 'reading' | 'finished' | 'abandoned');
    }
  };

  const currentStatusOption = statusOptions.find(s => s.value === status) ?? statusOptions[0];

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
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-text-primary">{book.title}</h2>
        <p className="text-text-secondary mt-1">{book.author}</p>
        {book.description && (
          <p className="text-sm text-text-secondary mt-3 line-clamp-4">{book.description}</p>
        )}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {onUpdateStatus ? (
            <select
              value={status}
              onChange={handleStatusChange}
              className={`text-sm px-3 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent ${currentStatusOption.color}`}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full ${currentStatusOption.color}`}>
              {currentStatusOption.label}
            </span>
          )}
        </div>
        {onUpdateProgress && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-text-secondary">Chapter</label>
              <input
                type="text"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                onBlur={handleProgressBlur}
                onKeyDown={handleProgressKeyDown}
                placeholder="e.g. 5"
                className="w-20 px-2 py-1 text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-text-secondary">Page</label>
              <input
                type="number"
                min={1}
                value={page}
                onChange={e => setPage(e.target.value)}
                onBlur={handleProgressBlur}
                onKeyDown={handleProgressKeyDown}
                placeholder="e.g. 112"
                className="w-20 px-2 py-1 text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}
        <CollectionSection bookId={book.id} />
      </div>
    </div>
  );
}
