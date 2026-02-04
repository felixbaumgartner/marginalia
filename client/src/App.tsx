import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ChatPage } from '@/pages/ChatPage';
import { ArchivePage } from '@/pages/ArchivePage';
import { NotesPage } from '@/pages/NotesPage';
import { StatsPage } from '@/pages/StatsPage';
import { useCurrentBook } from '@/hooks/useCurrentBook';
import type { BookSearchResult } from '@/types/book';

export default function App() {
  const { book: currentBook, loading, selectBook, switchBook, updateProgress } = useCurrentBook();

  const handleSelectBook = useCallback(async (searchResult: BookSearchResult) => {
    await selectBook(searchResult);
  }, [selectBook]);

  const handleSwitchBook = useCallback(async (bookId: number) => {
    await switchBook(bookId);
  }, [switchBook]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Marginalia</h1>
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell currentBook={currentBook} />}>
          <Route path="/" element={<HomePage currentBook={currentBook} onSelectBook={handleSelectBook} onUpdateProgress={updateProgress} />} />
          <Route path="/chat" element={<ChatPage currentBook={currentBook} />} />
          <Route path="/notes" element={<NotesPage currentBook={currentBook} />} />
          <Route path="/archive" element={<ArchivePage onSwitchBook={handleSwitchBook} />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
