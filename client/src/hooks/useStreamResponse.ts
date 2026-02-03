import { useState, useCallback, useRef } from 'react';
import { streamChat } from '@/api/chat';

export function useStreamResponse() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const abortRef = useRef(false);

  const startStream = useCallback(async (
    conversationId: number,
    content: string,
    onToken?: (fullText: string) => void
  ): Promise<string> => {
    setIsStreaming(true);
    setStreamedContent('');
    abortRef.current = false;

    let fullText = '';

    try {
      for await (const token of streamChat(conversationId, content)) {
        if (abortRef.current) break;
        fullText += token;
        setStreamedContent(fullText);
        onToken?.(fullText);
      }
    } catch (err) {
      console.error('Stream error:', err);
      throw err;
    } finally {
      setIsStreaming(false);
    }

    return fullText;
  }, []);

  const stopStream = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { isStreaming, streamedContent, startStream, stopStream };
}
