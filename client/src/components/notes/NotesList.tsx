import { useState } from 'react';
import type { Note } from '@/types/note';
import { NoteEditor } from './NoteEditor';

interface NotesListProps {
  notes: Note[];
  onEdit: (noteId: number, note: { content: string; chapter?: string; page?: number }) => Promise<unknown>;
  onDelete: (noteId: number) => Promise<unknown>;
}

export function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No notes yet. Start annotating your book above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map(note => (
        <div key={note.id} className="p-4 bg-surface-raised border border-border rounded-lg group">
          {editingId === note.id ? (
            <NoteEditor
              initialContent={note.content}
              initialChapter={note.chapter ?? ''}
              initialPage={note.page?.toString() ?? ''}
              onSave={async (updated) => {
                await onEdit(note.id, updated);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              saveLabel="Update"
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-text-primary whitespace-pre-wrap text-sm flex-1">{note.content}</p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setEditingId(note.id)}
                    className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {(note.chapter || note.page) && (
                <p className="text-xs text-accent/70 mt-2">
                  {[
                    note.chapter ? `Ch. ${note.chapter}` : null,
                    note.page ? `p. ${note.page}` : null,
                  ].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-xs text-text-secondary mt-1">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
