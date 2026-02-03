import Markdown from 'react-markdown';

export function ChatMessage({ role, content, isStreaming }: {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-surface-raised border border-border rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:bg-surface-overlay [&_code]:px-1 [&_code]:rounded [&_pre]:bg-surface-overlay [&_pre]:p-3 [&_pre]:rounded-lg">
            <Markdown>{content}</Markdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
