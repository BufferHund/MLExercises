import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Bookmark, ReadingStats, Settings } from '../types';

interface BookStore {
  // Books
  bookshelf: Book[];
  currentBook: Book | null;

  // Bookmarks
  bookmarks: Bookmark[];

  // Statistics
  stats: ReadingStats;

  // Settings
  settings: Settings;

  // Actions
  addToBookshelf: (book: Book) => void;
  setCurrentBook: (book: Book | null) => void;
  updateBookProgress: (bookId: string, progress: Partial<Book>) => void;

  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, 'id'>) => void;
  removeBookmark: (id: number) => void;
  getBookBookmarks: (bookId: string) => Bookmark[];

  // Stats actions
  updateStats: (stats: Partial<ReadingStats>) => void;
  incrementSessionTime: () => void;

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      // Initial state
      bookshelf: [],
      currentBook: null,
      bookmarks: [],
      stats: {
        sessionTime: 0,
        totalTime: 0,
        pagesRead: 0,
        startTime: Date.now(),
      },
      settings: {
        fontSize: 16,
        lineHeight: 1.6,
        theme: 'dark',
      },

      // Book actions
      addToBookshelf: (book) => {
        set((state) => {
          const existingIndex = state.bookshelf.findIndex((b) => b.id === book.id);
          let newBookshelf = [...state.bookshelf];

          if (existingIndex !== -1) {
            // Update existing book
            newBookshelf[existingIndex] = {
              ...newBookshelf[existingIndex],
              ...book,
              lastRead: new Date().toISOString(),
            };
          } else {
            // Add new book at the beginning
            newBookshelf.unshift({
              ...book,
              lastRead: new Date().toISOString(),
            });
          }

          // Keep only last 10 books
          if (newBookshelf.length > 10) {
            newBookshelf = newBookshelf.slice(0, 10);
          }

          return { bookshelf: newBookshelf };
        });
      },

      setCurrentBook: (book) => {
        set({ currentBook: book });
        if (book) {
          get().addToBookshelf(book);
        }
      },

      updateBookProgress: (bookId, progress) => {
        set((state) => ({
          bookshelf: state.bookshelf.map((book) =>
            book.id === bookId ? { ...book, ...progress } : book
          ),
          currentBook:
            state.currentBook?.id === bookId
              ? { ...state.currentBook, ...progress }
              : state.currentBook,
        }));
      },

      // Bookmark actions
      addBookmark: (bookmark) => {
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            { ...bookmark, id: Date.now() },
          ],
        }));
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      getBookBookmarks: (bookId) => {
        return get().bookmarks.filter((b) => b.bookId === bookId);
      },

      // Stats actions
      updateStats: (stats) => {
        set((state) => ({
          stats: { ...state.stats, ...stats },
        }));
      },

      incrementSessionTime: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            sessionTime: state.stats.sessionTime + 1,
          },
        }));
      },

      // Settings actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
    }),
    {
      name: 'moobi-storage',
      partialize: (state) => ({
        bookshelf: state.bookshelf,
        bookmarks: state.bookmarks,
        stats: {
          totalTime: state.stats.totalTime + state.stats.sessionTime,
          pagesRead: state.stats.pagesRead,
          sessionTime: 0,
          startTime: Date.now(),
        },
        settings: state.settings,
      }),
    }
  )
);
