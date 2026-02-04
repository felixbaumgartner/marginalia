import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ChatPage } from '@/pages/ChatPage';
import { ArchivePage } from '@/pages/ArchivePage';
import { NotesPage } from '@/pages/NotesPage';
import { StatsPage } from '@/pages/StatsPage';
import { useActiveBooks } from '@/hooks/useCurrentBook';
import type { BookSearchResult } from '@/types/book';

export default function App() {
  const {
    activeBooks,
    selectedBook,
    selectedBookId,
    setSelectedBookId,
    loading,
    selectBook,
    switchBook,
    removeActiveBook,
    updateProgress,
    updateStatus,
  } = useActiveBooks();

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
        <Route element={
          <AppShell
            activeBooks={activeBooks}
            selectedBook={selectedBook}
            selectedBookId={selectedBookId}
            onSelectBookId={setSelectedBookId}
            onRemoveBook={removeActiveBook}
          />
        }>
          <Route path="/" element={<HomePage selectedBook={selectedBook} activeBooks={activeBooks} onSelectBook={handleSelectBook} onUpdateProgress={updateProgress} onUpdateStatus={updateStatus} />} />
          <Route path="/chat" element={<ChatPage selectedBook={selectedBook} />} />
          <Route path="/notes" element={<NotesPage selectedBook={selectedBook} />} />
          <Route path="/archive" element={<ArchivePage onSwitchBook={handleSwitchBook} />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
