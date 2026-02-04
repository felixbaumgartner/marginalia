export interface Note {
  id: number;
  book_id: number;
  chapter: string | null;
  page: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}
