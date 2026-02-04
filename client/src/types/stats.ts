export interface ReadingStats {
  total_books: number;
  books_reading: number;
  books_finished: number;
  books_abandoned: number;
  total_conversations: number;
  total_messages: number;
  books_by_month: Array<{ month: string; count: number }>;
}
