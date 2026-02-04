import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '@/types/message';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmptyState } from '@/components/common/EmptyState';
import { useStreamResponse } from '@/hooks/useStreamResponse';

export function ChatPanel({ conversationId, messages, onMessageSent, bookTitle, initialValue }: {
  conversationId: number | null;
  messages: Message[];
  onMessageSent: (userMessage: Message, assistantMessage: Message) => void;
  bookTitle: string;
  initialValue?: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isStreaming, streamedContent, startStream } = useStreamResponse();
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedContent, scrollToBottom]);

  const handleSend = useCallback(async (content: string) => {
    if (!conversationId) return;
    setError(null);

    const userMessage: Message = {
      id: Date.now(),
      conversation_id: conversationId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    // Optimistically add user message
    onMessageSent(userMessage, null as unknown as Message);

    try {
      const fullResponse = await startStream(conversationId, content);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        conversation_id: conversationId,
        role: 'assistant',
        content: fullResponse,
        created_at: new Date().toISOString(),
      };

      onMessageSent(null as unknown as Message, assistantMessage);
    } catch (err) {
      console.error('Failed to get response:', err);
      setError('Failed to get a response. Please check your API key and try again.');
    }
  }, [conversationId, startStream, onMessageSent]);

  if (!conversationId) {
    return (
      <EmptyState
        icon="💬"
        title="Start a conversation"
        description={`Ask anything about "${bookTitle}"`}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isStreaming && !error && (
          <EmptyState
            icon="📖"
            title={`Ask about "${bookTitle}"`}
            description="Ask about themes, characters, plot, historical context, or anything else."
          />
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isStreaming && (
          <ChatMessage role="assistant" content={streamedContent} isStreaming />
        )}
        {error && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-bl-sm">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} initialValue={initialValue} />
    </div>
  );
}
