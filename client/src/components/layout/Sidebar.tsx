import { NavLink } from 'react-router-dom';
import type { Book } from '@/types/book';

interface SidebarProps {
  activeBooks: Book[];
  selectedBook: Book | null;
  selectedBookId: number | null;
  onSelectBookId: (id: number) => void;
  onRemoveBook: (id: number) => Promise<void>;
}

export function Sidebar({ activeBooks, selectedBookId, onSelectBookId, onRemoveBook }: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'
    }`;

  return (
    <aside className="w-64 bg-surface-raised border-r border-border flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text-primary tracking-tight">Marginalia</h1>
        <p className="text-xs text-text-secondary mt-0.5">Reading companion</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/" className={linkClass} end>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/chat" className={linkClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chat
        </NavLink>
        <NavLink to="/notes" className={linkClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Notes
        </NavLink>
        <NavLink to="/archive" className={linkClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Archive
        </NavLink>
        <NavLink to="/stats" className={linkClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Stats
        </NavLink>
      </nav>

      {activeBooks.length > 0 && (
        <div className="p-3 border-t border-border overflow-y-auto max-h-60">
          <p className="text-xs text-text-secondary mb-2">Currently reading</p>
          <div className="space-y-1">
            {activeBooks.map(book => (
              <button
                key={book.id}
                onClick={() => onSelectBookId(book.id)}
                className={`flex items-center gap-2 w-full p-1.5 rounded-lg text-left transition-colors group ${
                  selectedBookId === book.id
                    ? 'bg-accent/10 ring-1 ring-accent/30'
                    : 'hover:bg-surface-overlay'
                }`}
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt="" className="w-7 h-10 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-10 bg-surface-overlay rounded shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs truncate font-medium ${selectedBookId === book.id ? 'text-accent' : 'text-text-primary'}`}>
                    {book.title}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">{book.author}</p>
                  {(book.current_chapter || book.current_page) && (
                    <p className="text-[10px] text-accent/70 truncate">
                      {[
                        book.current_chapter ? `Ch. ${book.current_chapter}` : null,
                        book.current_page ? `p. ${book.current_page}` : null,
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <span
                  onClick={(e) => { e.stopPropagation(); onRemoveBook(book.id); }}
                  className="p-0.5 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all shrink-0"
                  title="Remove from reading list"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
