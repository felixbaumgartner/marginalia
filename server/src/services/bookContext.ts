interface NoteInfo {
  chapter: string | null;
  page: number | null;
  content: string;
}

interface OtherBookInfo {
  title: string;
  author: string | null;
  status: string;
}

interface BookInfo {
  title: string;
  author: string | null;
  description: string | null;
  currentChapter: string | null;
  currentPage: number | null;
  notes?: NoteInfo[];
  otherBooks?: OtherBookInfo[];
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

  if (book.currentChapter || book.currentPage) {
    const progress: string[] = [];
    if (book.currentChapter) progress.push(`Chapter: ${book.currentChapter}`);
    if (book.currentPage) progress.push(`Page: ${book.currentPage}`);
    parts.push(``, `The user's current reading progress: ${progress.join(', ')}`);
    parts.push(`IMPORTANT: Do NOT reveal any plot points, character developments, or events that occur after the user's current reading position. If the user asks about something ahead of where they are, gently let them know you're avoiding spoilers.`);
  }

  if (book.notes && book.notes.length > 0) {
    parts.push(``, `The user has made the following reading notes/annotations:`);
    for (const note of book.notes.slice(0, 10)) {
      const location = [note.chapter ? `Ch. ${note.chapter}` : null, note.page ? `p. ${note.page}` : null].filter(Boolean).join(', ');
      const truncated = note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content;
      parts.push(`- ${location ? `[${location}] ` : ''}${truncated}`);
    }
  }

  if (book.otherBooks && book.otherBooks.length > 0) {
    parts.push(``, `The user has also read or is reading these other books:`);
    for (const other of book.otherBooks) {
      parts.push(`- "${other.title}"${other.author ? ` by ${other.author}` : ''} (${other.status})`);
    }
    parts.push(`When relevant, you can draw connections, comparisons, or references to these other books the user has experienced. If the user asks you to compare themes, characters, or ideas across books, use your knowledge of these works.`);
  }

  parts.push(
    ``,
    `Help the user understand this book. Answer questions about themes, characters, plot, historical context, the author's style, and related works. If you don't know something specific about this book, say so honestly. Keep responses conversational and insightful.`
  );

  return parts.join('\n');
}
