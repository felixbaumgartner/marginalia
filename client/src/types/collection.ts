export interface CollectionItem {
  id: number;
  book_id: number;
  type: 'vocabulary' | 'quote';
  content: string;
  note: string | null;
  chapter: string | null;
  page: number | null;
  created_at: string;
}
