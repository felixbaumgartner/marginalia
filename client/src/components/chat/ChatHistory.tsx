import type { Conversation } from '@/types/conversation';

export function ChatHistory({ conversations, activeId, onSelect, onDelete, onNew }: {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <button
          onClick={onNew}
          className="w-full px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg font-medium transition-colors"
        >
          New conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-3 text-sm text-text-secondary text-center">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between px-3 py-2 cursor-pointer border-b border-border hover:bg-surface-overlay transition-colors ${
                activeId === conv.id ? 'bg-surface-overlay' : ''
              }`}
            >
              <button
                onClick={() => onSelect(conv.id)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm text-text-primary truncate">
                  {conv.title || 'New conversation'}
                </p>
                <p className="text-xs text-text-secondary">
                  {new Date(conv.created_at).toLocaleDateString()}
                </p>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 ml-2 transition-opacity"
                title="Delete conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
