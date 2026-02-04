import type { CollectionItem } from '@/types/collection';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export function getBookCollections(bookId: number, type?: 'vocabulary' | 'quote'): Promise<CollectionItem[]> {
  const query = type ? `?type=${type}` : '';
  return apiGet(`/collections/books/${bookId}/collections${query}`);
}

export function createCollectionItem(bookId: number, item: {
  type: 'vocabulary' | 'quote';
  content: string;
  note?: string;
  chapter?: string;
  page?: number;
}): Promise<CollectionItem> {
  return apiPost(`/collections/books/${bookId}/collections`, item);
}

export function updateCollectionItem(id: number, item: {
  content: string;
  note?: string;
  chapter?: string;
  page?: number;
}): Promise<CollectionItem> {
  return apiPut(`/collections/${id}`, item);
}

export function deleteCollectionItem(id: number): Promise<void> {
  return apiDelete(`/collections/${id}`);
}
