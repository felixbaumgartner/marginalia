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
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeBooks={activeBooks}
        selectedBook={selectedBook}
        selectedBookId={selectedBookId}
        onSelectBookId={onSelectBookId}
        onRemoveBook={onRemoveBook}
      />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
