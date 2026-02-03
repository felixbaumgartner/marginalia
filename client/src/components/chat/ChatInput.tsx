import { useState, useRef, useCallback } from 'react';

export function ChatInput({ onSend, disabled }: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-border bg-surface">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => { setMessage(e.target.value); handleInput(); }}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your book..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none px-4 py-3 bg-surface-raised border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        className="px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        Send
      </button>
    </div>
  );
}
