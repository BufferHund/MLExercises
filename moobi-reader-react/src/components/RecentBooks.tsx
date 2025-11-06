import type { Book } from '../types';

interface RecentBooksProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export default function RecentBooks({ books, onBookClick }: RecentBooksProps) {
  if (books.length === 0) return null;

  const getBookIcon = (format: string) => {
    switch (format) {
      case 'epub': return '📖';
      case 'pdf': return '📄';
      case 'txt': return '📝';
      case 'mobi':
      case 'azw':
      case 'azw3': return '📚';
      case 'docx': return '📃';
      case 'md': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold mb-5 text-white">最近阅读</h3>
      <div className="space-y-4">
        {books.slice(0, 3).map((book, index) => (
          <div
            key={book.id}
            className="group flex items-center gap-5 p-5 bg-white/5 hover:bg-white/10 rounded-3xl cursor-pointer transition-all duration-300 ease-smooth hover:translate-x-2 hover:shadow-soft-lg border border-white/10 hover:border-white/20 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onBookClick(book)}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft group-hover:shadow-soft-lg group-hover:scale-110 transition-all duration-300">
              <span className="text-3xl">{getBookIcon(book.format)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate text-white">{book.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
                <span className="text-sm text-white/70 font-semibold min-w-[3rem]">
                  {book.progress}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
