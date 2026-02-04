import type { Book } from '@/types/book';
import { BookArchive } from '@/components/books/BookArchive';
import { useNavigate } from 'react-router-dom';

export function ArchivePage({ onSwitchBook }: {
  onSwitchBook: (bookId: number) => Promise<void>;
}) {
  const navigate = useNavigate();

  const handleSelectBook = async (book: Book) => {
    await onSwitchBook(book.id);
    navigate('/');
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Reading Archive</h2>
        <p className="text-text-secondary mb-8">All the books you've explored.</p>
        <BookArchive onSelectBook={handleSelectBook} />
      </div>
    </div>
  );
}
