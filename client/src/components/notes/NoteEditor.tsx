import { useState } from 'react';

interface NoteEditorProps {
  initialContent?: string;
  initialChapter?: string;
  initialPage?: string;
  onSave: (note: { content: string; chapter?: string; page?: number }) => void;
  onCancel?: () => void;
  saveLabel?: string;
}

export function NoteEditor({ initialContent = '', initialChapter = '', initialPage = '', onSave, onCancel, saveLabel = 'Save' }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [chapter, setChapter] = useState(initialChapter);
  const [page, setPage] = useState(initialPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({
      content: content.trim(),
      chapter: chapter.trim() || undefined,
      page: page.trim() ? Number(page) : undefined,
    });
    if (!initialContent) {
      setContent('');
      setChapter('');
      setPage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your note..."
        rows={3}
        className="w-full resize-none px-4 py-3 bg-surface-raised border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-text-secondary">Chapter</label>
          <input
            type="text"
            value={chapter}
            onChange={e => setChapter(e.target.value)}
            placeholder="e.g. 5"
            className="w-20 px-2 py-1.5 text-sm bg-surface-raised border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-text-secondary">Page</label>
          <input
            type="number"
            value={page}
            onChange={e => setPage(e.target.value)}
            placeholder="e.g. 42"
            className="w-20 px-2 py-1.5 text-sm bg-surface-raised border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex-1" />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
