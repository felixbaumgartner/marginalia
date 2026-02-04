import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  initialValue?: string;
}

export function ChatInput({ onSend, disabled, initialValue }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [passageMode, setPassageMode] = useState(false);
  const [passage, setPassage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const passageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;

    if (passageMode) {
      const trimmedPassage = passage.trim();
      const trimmedQuestion = message.trim();
      if (!trimmedPassage) return;
      const formatted = trimmedQuestion
        ? `[PASSAGE FROM THE BOOK]\n> ${trimmedPassage.split('\n').join('\n> ')}\n\n${trimmedQuestion}`
        : `[PASSAGE FROM THE BOOK]\n> ${trimmedPassage.split('\n').join('\n> ')}\n\nWhat are your thoughts on this passage?`;
      onSend(formatted);
      setPassage('');
      setMessage('');
      setPassageMode(false);
    } else {
      const trimmed = message.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setMessage('');
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, passage, passageMode, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-border bg-surface p-4">
      {passageMode && (
        <div className="mb-3">
          <label className="text-xs text-text-secondary mb-1 block">Paste a passage from the book</label>
          <textarea
            ref={passageRef}
            value={passage}
            onChange={(e) => { setPassage(e.target.value); handleInput(passageRef); }}
            onKeyDown={handleKeyDown}
            placeholder="Paste or type a passage..."
            disabled={disabled}
            rows={2}
            className="w-full resize-none px-4 py-3 bg-surface-raised border-l-4 border-accent border-y border-r border-y-border border-r-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none transition-colors disabled:opacity-50 italic"
          />
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => setPassageMode(!passageMode)}
          title={passageMode ? 'Exit passage mode' : 'Quote a passage'}
          className={`px-3 py-3 rounded-lg transition-colors shrink-0 ${
            passageMode
              ? 'bg-accent/20 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => { setMessage(e.target.value); handleInput(textareaRef); }}
          onKeyDown={handleKeyDown}
          placeholder={passageMode ? 'Your question about this passage...' : 'Ask about your book...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-4 py-3 bg-surface-raised border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || (passageMode ? !passage.trim() : !message.trim())}
          className="px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}
