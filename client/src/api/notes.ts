import type { Note } from '@/types/note';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export function getBookNotes(bookId: number): Promise<Note[]> {
  return apiGet(`/notes/books/${bookId}/notes`);
}

export function createNote(bookId: number, note: { content: string; chapter?: string; page?: number }): Promise<Note> {
  return apiPost(`/notes/books/${bookId}/notes`, note);
}

export function updateNote(noteId: number, note: { content: string; chapter?: string; page?: number }): Promise<Note> {
  return apiPut(`/notes/${noteId}`, note);
}

export function deleteNote(noteId: number): Promise<void> {
  return apiDelete(`/notes/${noteId}`);
}
