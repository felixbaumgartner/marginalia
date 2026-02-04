import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import type { Book } from '@/types/book';

interface AppShellProps {
  activeBooks: Book[];
  selectedBook: Book | null;
  selectedBookId: number | null;
  onSelectBookId: (id: number) => void;
  onRemoveBook: (id: number) => Promise<void>;
}

export function AppShell({ activeBooks, selectedBook, selectedBookId, onSelectBookId, onRemoveBook }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 bg-surface-raised border border-border rounded-lg text-text-primary"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-200
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          activeBooks={activeBooks}
          selectedBook={selectedBook}
          selectedBookId={selectedBookId}
          onSelectBookId={onSelectBookId}
          onRemoveBook={onRemoveBook}
          onClose={closeSidebar}
        />
      </div>

      <main className="flex-1 overflow-hidden pt-12 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
