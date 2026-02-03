import { NavLink } from 'react-router-dom';
import type { Book } from '@/types/book';

export function Sidebar({ currentBook }: { currentBook: Book | null }) {
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
        <NavLink to="/archive" className={linkClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Archive
        </NavLink>
      </nav>

      {currentBook && (
        <div className="p-3 border-t border-border">
          <p className="text-xs text-text-secondary mb-2">Currently reading</p>
          <div className="flex items-center gap-2">
            {currentBook.cover_url ? (
              <img src={currentBook.cover_url} alt="" className="w-8 h-12 rounded object-cover shrink-0" />
            ) : (
              <div className="w-8 h-12 bg-surface-overlay rounded shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-text-primary truncate font-medium">{currentBook.title}</p>
              <p className="text-xs text-text-secondary truncate">{currentBook.author}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
