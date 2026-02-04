export interface OpenLibrarySearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_edition_key?: string;
  edition_key?: string[];
  first_sentence?: { [key: string]: string } | string;
}

export interface BookSearchResult {
  workId: string;
  title: string;
  author: string;
  publishYear: number | null;
  coverUrl: string | null;
  editionId: string | null;
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,first_publish_year,cover_edition_key,edition_key`;
  const response = await fetch(url);
  const data = await response.json();

  return (data.docs || []).map((doc: OpenLibrarySearchResult) => {
    const editionId = doc.cover_edition_key || doc.edition_key?.[0] || null;
    return {
      workId: doc.key.replace('/works/', ''),
      title: doc.title,
      author: doc.author_name?.[0] || 'Unknown',
      publishYear: doc.first_publish_year || null,
      coverUrl: editionId
        ? `https://covers.openlibrary.org/b/olid/${editionId}-M.jpg`
        : null,
      editionId,
    };
  });
}

export async function getBookDetails(workId: string): Promise<{ description: string | null }> {
  const url = `https://openlibrary.org/works/${workId}.json`;
  const response = await fetch(url);
  const data = await response.json();

  let description: string | null = null;
  if (data.description) {
    description = typeof data.description === 'string'
      ? data.description
      : data.description.value || null;
  }

  return { description };
}
