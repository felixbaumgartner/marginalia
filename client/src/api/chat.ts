import type { Conversation } from '@/types/conversation';
import type { Message } from '@/types/message';
import { apiGet, apiDelete } from './client';

export function getConversation(id: number): Promise<Conversation & { messages: Message[] }> {
  return apiGet(`/conversations/${id}`);
}

export function deleteConversation(id: number): Promise<void> {
  return apiDelete(`/conversations/${id}`);
}

export async function* streamChat(
  conversationId: number,
  content: string
): AsyncGenerator<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: conversationId, content }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to send message' }));
    throw new Error(error.error);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.token) yield parsed.token;
      } catch {
        // skip unparseable lines
      }
    }
  }
}
