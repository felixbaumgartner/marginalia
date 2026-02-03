import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import type { Book } from '@/types/book';

export function AppShell({ currentBook }: { currentBook: Book | null }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentBook={currentBook} />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
