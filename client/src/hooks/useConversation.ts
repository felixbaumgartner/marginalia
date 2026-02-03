import { useState, useCallback } from 'react';
import type { Conversation } from '@/types/conversation';
import type { Message } from '@/types/message';
import { getBookConversations, createConversation } from '@/api/books';
import { getConversation, deleteConversation } from '@/api/chat';

export function useConversation(bookId: number | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!bookId) return;
    try {
      const convs = await getBookConversations(bookId);
      setConversations(convs);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  }, [bookId]);

  const startNewConversation = useCallback(async () => {
    if (!bookId) return null;
    setLoading(true);
    try {
      const conv = await createConversation(bookId);
      setActiveConversation(conv);
      setMessages([]);
      await fetchConversations();
      return conv;
    } finally {
      setLoading(false);
    }
  }, [bookId, fetchConversations]);

  const loadConversation = useCallback(async (convId: number) => {
    setLoading(true);
    try {
      const data = await getConversation(convId);
      setActiveConversation(data);
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeConversation = useCallback(async (convId: number) => {
    await deleteConversation(convId);
    if (activeConversation?.id === convId) {
      setActiveConversation(null);
      setMessages([]);
    }
    await fetchConversations();
  }, [activeConversation, fetchConversations]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      }
      return updated;
    });
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    fetchConversations,
    startNewConversation,
    loadConversation,
    removeConversation,
    addMessage,
    updateLastMessage,
  };
}
