import { useEffect, useCallback } from 'react';
import type { Book } from '@/types/book';
import type { Message } from '@/types/message';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { EmptyState } from '@/components/common/EmptyState';
import { useConversation } from '@/hooks/useConversation';
import { useNavigate } from 'react-router-dom';

export function ChatPage({ currentBook }: { currentBook: Book | null }) {
  const navigate = useNavigate();
  const {
    conversations,
    activeConversation,
    messages,
    fetchConversations,
    startNewConversation,
    loadConversation,
    removeConversation,
    addMessage,
  } = useConversation(currentBook?.id ?? null);

  useEffect(() => {
    if (currentBook) {
      fetchConversations();
    }
  }, [currentBook, fetchConversations]);

  const handleNewConversation = useCallback(async () => {
    await startNewConversation();
  }, [startNewConversation]);

  const handleMessageSent = useCallback((userMsg: Message, assistantMsg: Message) => {
    if (userMsg) {
      addMessage(userMsg);
    }
    if (assistantMsg) {
      addMessage(assistantMsg);
      fetchConversations();
    }
  }, [addMessage, fetchConversations]);

  if (!currentBook) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <EmptyState
          icon="📚"
          title="No book selected"
          description="Search for a book on the Home page to start chatting."
        />
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border shrink-0 bg-surface">
        <ChatHistory
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={loadConversation}
          onDelete={removeConversation}
          onNew={handleNewConversation}
        />
      </div>
      <div className="flex-1">
        <ChatPanel
          conversationId={activeConversation?.id ?? null}
          messages={messages}
          onMessageSent={handleMessageSent}
          bookTitle={currentBook.title}
        />
      </div>
    </div>
  );
}
