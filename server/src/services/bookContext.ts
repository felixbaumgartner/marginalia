interface BookInfo {
  title: string;
  author: string | null;
  description: string | null;
}

export function buildSystemPrompt(book: BookInfo): string {
  const parts = [
    `You are a knowledgeable reading companion. The user is currently reading:`,
    ``,
    `Title: ${book.title}`,
  ];

  if (book.author) {
    parts.push(`Author: ${book.author}`);
  }

  if (book.description) {
    parts.push(`Description: ${book.description}`);
  }

  parts.push(
    ``,
    `Help the user understand this book. Answer questions about themes, characters, plot, historical context, the author's style, and related works. If you don't know something specific about this book, say so honestly. Keep responses conversational and insightful.`
  );

  return parts.join('\n');
}
