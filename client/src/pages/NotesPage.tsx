import { Link } from 'react-router-dom';
import type { Book } from '@/types/book';
import { useNotes } from '@/hooks/useNotes';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { NotesList } from '@/components/notes/NotesList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export function NotesPage({ currentBook }: { currentBook: Book | null }) {
  const { notes, loading, addNote, editNote, removeNote } = useNotes(currentBook?.id ?? null);

  if (!currentBook) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon="📖"
          title="No book selected"
          description="Select a book first to start taking notes."
        />
        <Link to="/" className="absolute mt-32 px-4 py-2 bg-accent text-white rounded-lg text-sm">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-1">Notes</h2>
          <p className="text-text-secondary text-sm">
            Your annotations for <span className="text-text-primary font-medium">{currentBook.title}</span>
          </p>
        </div>

        <div className="mb-8 p-4 bg-surface-raised border border-border rounded-lg">
          <h3 className="text-sm font-medium text-text-primary mb-3">Add a note</h3>
          <NoteEditor
            onSave={addNote}
            saveLabel="Add note"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <NotesList notes={notes} onEdit={editNote} onDelete={removeNote} />
        )}
      </div>
    </div>
  );
}
