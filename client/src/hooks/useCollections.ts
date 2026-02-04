import { useState, useEffect, useCallback } from 'react';
import type { CollectionItem } from '@/types/collection';
import { getBookCollections, createCollectionItem, updateCollectionItem, deleteCollectionItem } from '@/api/collections';

export function useCollections(bookId: number | null) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!bookId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getBookCollections(bookId);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (item: {
    type: 'vocabulary' | 'quote';
    content: string;
    note?: string;
    chapter?: string;
    page?: number;
  }) => {
    if (!bookId) return;
    const created = await createCollectionItem(bookId, item);
    setItems(prev => [created, ...prev]);
    return created;
  }, [bookId]);

  const editItem = useCallback(async (id: number, item: {
    content: string;
    note?: string;
    chapter?: string;
    page?: number;
  }) => {
    const updated = await updateCollectionItem(id, item);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  }, []);

  const removeItem = useCallback(async (id: number) => {
    await deleteCollectionItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return { items, loading, fetchItems, addItem, editItem, removeItem };
}
