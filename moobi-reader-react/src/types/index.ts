// Book types
export interface Book {
  id: string;
  title: string;
  author: string;
  format: 'epub' | 'pdf' | 'txt' | 'md' | 'mobi' | 'docx' | 'doc';
  progress: number;
  currentPage: number;
  totalPages: number;
  lastRead: string;
  coverUrl?: string;
}

// Bookmark types
export interface Bookmark {
  id: number;
  bookId: string;
  bookTitle: string;
  page: number;
  totalPages: number;
  timestamp: string;
  format: 'epub' | 'pdf' | 'txt' | 'md' | 'mobi' | 'docx' | 'doc';
  cfi?: string; // For EPUB
  note?: string;
}

// Reading statistics
export interface ReadingStats {
  sessionTime: number; // minutes
  totalTime: number; // minutes
  pagesRead: number;
  startTime: number; // timestamp
}

// Search result
export interface SearchResult {
  cfi: string;
  excerpt: string;
  query: string;
}

// Settings
export interface Settings {
  fontSize: number;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
}

// TOC Item
export interface TocItem {
  label: string;
  href: string;
  subitems?: TocItem[];
}
