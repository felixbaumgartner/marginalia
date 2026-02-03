import type { Book, BookSearchResult } from '@/types/book';
import type { Conversation } from '@/types/conversation';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export function searchBooks(query: string): Promise<BookSearchResult[]> {
  return apiGet(`/books/search?q=${encodeURIComponent(query)}`);
}

export function getBookDetails(workId: string): Promise<{ description: string | null }> {
  return apiGet(`/books/details/${workId}`);
}

export function getAllBooks(): Promise<Book[]> {
  return apiGet('/books');
}

export function getCurrentBook(): Promise<Book | null> {
  return apiGet('/books/current');
}

export function saveBook(book: {
  ol_work_id: string;
  ol_edition_id: string | null;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
}): Promise<Book> {
  return apiPost('/books', book);
}

export function setCurrentBook(id: number): Promise<Book> {
  return apiPut(`/books/${id}/current`);
}

export function deleteBook(id: number): Promise<void> {
  return apiDelete(`/books/${id}`);
}

export function getBookConversations(bookId: number): Promise<Conversation[]> {
  return apiGet(`/books/${bookId}/conversations`);
}

export function createConversation(bookId: number): Promise<Conversation> {
  return apiPost(`/books/${bookId}/conversations`, {});
}
