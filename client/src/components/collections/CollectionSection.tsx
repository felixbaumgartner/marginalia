import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CollectionItem } from '@/types/collection';
import { useCollections } from '@/hooks/useCollections';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function CollectionSection({ bookId }: { bookId: number }) {
  const { items, loading, addItem, removeItem } = useCollections(bookId);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'quote'>('vocabulary');
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [chapter, setChapter] = useState('');
  const [page, setPage] = useState('');
  const navigate = useNavigate();

  const filtered = items.filter(i => i.type === activeTab);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addItem({
      type: activeTab,
      content: content.trim(),
      note: note.trim() || undefined,
      chapter: chapter.trim() || undefined,
      page: page.trim() ? Number(page) : undefined,
    });
    setContent('');
    setNote('');
    setChapter('');
    setPage('');
    setShowForm(false);
  };

  const handleAskClaude = (item: CollectionItem) => {
    const prefill = item.type === 'vocabulary'
      ? `What does "${item.content}" mean in the context of this book?`
      : `I'd like to discuss this quote:\n> ${item.content}`;
    navigate('/chat', { state: { prefill } });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'vocabulary' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Vocabulary
          </button>
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'quote' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Quotes
          </button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : `+ Add ${activeTab === 'vocabulary' ? 'word' : 'quote'}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 p-3 bg-surface border border-border rounded-lg space-y-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={activeTab === 'vocabulary' ? 'Word or phrase...' : 'Quote from the book...'}
            className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={activeTab === 'vocabulary' ? 'Definition or context...' : 'Your thoughts on this quote...'}
            className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              placeholder="Ch."
              className="w-16 px-2 py-1.5 text-sm bg-surface-raised border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              value={page}
              onChange={e => setPage(e.target.value)}
              placeholder="Page"
              className="w-16 px-2 py-1.5 text-sm bg-surface-raised border border-border rounded text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
            />
            <div className="flex-1" />
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded font-medium transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-4">
          No {activeTab === 'vocabulary' ? 'vocabulary' : 'quotes'} saved yet.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="p-3 bg-surface border border-border rounded-lg group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {item.type === 'quote' ? (
                    <p className="text-sm text-text-primary italic border-l-2 border-accent/40 pl-3">"{item.content}"</p>
                  ) : (
                    <p className="text-sm text-text-primary font-medium">{item.content}</p>
                  )}
                  {item.note && (
                    <p className="text-xs text-text-secondary mt-1">{item.note}</p>
                  )}
                  {(item.chapter || item.page) && (
                    <p className="text-xs text-accent/70 mt-1">
                      {[item.chapter ? `Ch. ${item.chapter}` : null, item.page ? `p. ${item.page}` : null].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleAskClaude(item)}
                    className="p-1 text-text-secondary hover:text-accent transition-colors"
                    title="Ask Claude about this"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
