export interface BookSearchResult {
  workId: string;
  title: string;
  author: string;
  publishYear: number | null;
  coverUrl: string | null;
  editionId: string | null;
}

export interface Book {
  id: number;
  ol_work_id: string;
  ol_edition_id: string | null;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  is_current: number;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
}
