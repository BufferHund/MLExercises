import { useState, useEffect } from 'react';
import { Book, Clock, Bookmark, TrendingUp, Search, Trash2, BookOpen, ArrowLeft } from 'lucide-react';

interface BookData {
  fileName: string;
  fileType: string;
  fileSize: number;
  lastOpened: number;
  currentPage?: number;
  totalPages?: number;
  progress: number;
  readingTime: number; // 总阅读时间（秒）
  addedDate: number;
}

interface BookmarkData {
  id: string;
  fileName: string;
  page?: number;
  progress: number;
  timestamp: number;
  note?: string;
  color?: string;
}

interface HighlightData {
  id: string;
  fileName: string;
  page?: number;
  text: string;
  color: string;
  timestamp: number;
  note?: string;
}

interface BookshelfProps {
  onOpenFile: (file: File) => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export default function Bookshelf({ onOpenFile: _onOpenFile, onBack, theme }: BookshelfProps) {
  const [books, setBooks] = useState<BookData[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'bookmarks' | 'highlights' | 'stats'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent');

  // 加载数据
  useEffect(() => {
    loadBooks();
    loadBookmarks();
    loadHighlights();
  }, []);

  const loadBooks = () => {
    const saved = localStorage.getItem('moobi-books');
    if (saved) {
      try {
        setBooks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load books:', e);
      }
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('moobi-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }
  };

  const loadHighlights = () => {
    const saved = localStorage.getItem('moobi-highlights');
    if (saved) {
      try {
        setHighlights(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load highlights:', e);
      }
    }
  };

  const removeBook = (fileName: string) => {
    const newBooks = books.filter(b => b.fileName !== fileName);
    setBooks(newBooks);
    localStorage.setItem('moobi-books', JSON.stringify(newBooks));
    console.log('📚 Book removed:', fileName);
  };

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(newBookmarks);
    localStorage.setItem('moobi-bookmarks', JSON.stringify(newBookmarks));
    console.log('📌 Bookmark removed:', id);
  };

  const removeHighlight = (id: string) => {
    const newHighlights = highlights.filter(h => h.id !== id);
    setHighlights(newHighlights);
    localStorage.setItem('moobi-highlights', JSON.stringify(newHighlights));
    console.log('✨ Highlight removed:', id);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    if (mb > 1) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    }
    return date.toLocaleDateString('zh-CN');
  };

  const getSortedBooks = () => {
    let filtered = books.filter(book =>
      book.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => b.lastOpened - a.lastOpened);
      case 'name':
        return filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
      case 'progress':
        return filtered.sort((a, b) => b.progress - a.progress);
      default:
        return filtered;
    }
  };

  const getTotalStats = () => {
    const totalReadingTime = books.reduce((sum, book) => sum + book.readingTime, 0);
    const totalBooks = books.length;
    const completedBooks = books.filter(b => b.progress >= 100).length;
    const totalBookmarks = bookmarks.length;
    const totalHighlights = highlights.length;

    return {
      totalReadingTime,
      totalBooks,
      completedBooks,
      totalBookmarks,
      totalHighlights,
    };
  };

  const stats = getTotalStats();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* 标题栏 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-900/10'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                  title="返回主页"
                >
                  <ArrowLeft className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                </button>
              )}
              <Book className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Moobi 书架
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  {stats.totalBooks} 本书籍 · {formatTime(stats.totalReadingTime)} 阅读时长
                </p>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'}`}>
                <Search className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                <input
                  type="text"
                  placeholder="搜索书籍..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm w-64 ${theme === 'dark' ? 'text-white placeholder-white/40' : 'text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900/10 text-gray-900'}`}
              >
                <option value="recent">最近阅读</option>
                <option value="name">按名称</option>
                <option value="progress">按进度</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'library'
                ? theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>书库 ({books.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span>书签 ({bookmarks.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'highlights'
                ? theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">✨</span>
              <span>标注 ({highlights.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'stats'
                ? theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>统计</span>
            </div>
          </button>
        </div>

        {/* 书库标签页 */}
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedBooks().map((book) => (
              <div
                key={book.fileName}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {book.fileName}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                        {book.fileType.toUpperCase()} · {formatFileSize(book.fileSize)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeBook(book.fileName)}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      title="删除"
                    >
                      <Trash2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                    </button>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                        阅读进度
                      </span>
                      <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {book.progress}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} mb-4`}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(book.readingTime)}</span>
                    </div>
                    <span>{formatDate(book.lastOpened)}</span>
                  </div>

                  {/* 继续阅读按钮 */}
                  <button
                    onClick={() => {
                      // TODO: 打开文件
                      console.log('Open book:', book.fileName);
                    }}
                    className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                      theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    继续阅读
                  </button>
                </div>
              </div>
            ))}

            {getSortedBooks().length === 0 && (
              <div className="col-span-full text-center py-16">
                <Book className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  {searchQuery ? '没有找到匹配的书籍' : '书架是空的'}
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                  {searchQuery ? '试试其他搜索关键词' : '点击首页添加第一本书'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 书签标签页 */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bookmark className={`w-4 h-4 ${bookmark.color || 'text-primary'}`} />
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {bookmark.fileName}
                      </h3>
                    </div>
                    {bookmark.page && (
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                        第 {bookmark.page} 页 · {bookmark.progress}%
                      </p>
                    )}
                    {bookmark.note && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'} bg-yellow-500/10 p-3 rounded-lg`}>
                        {bookmark.note}
                      </p>
                    )}
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                      {formatDate(bookmark.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    title="删除"
                  >
                    <Trash2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            ))}

            {bookmarks.length === 0 && (
              <div className="text-center py-16">
                <Bookmark className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  还没有书签
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                  在阅读时点击书签按钮添加
                </p>
              </div>
            )}
          </div>
        )}

        {/* 标注标签页 */}
        {activeTab === 'highlights' && (
          <div className="space-y-4">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: highlight.color }} />
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {highlight.fileName}
                      </h3>
                    </div>
                    <div
                      className={`p-4 rounded-lg mb-2`}
                      style={{ backgroundColor: `${highlight.color}20` }}
                    >
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                        "{highlight.text}"
                      </p>
                    </div>
                    {highlight.note && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} italic`}>
                        笔记: {highlight.note}
                      </p>
                    )}
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                      {highlight.page && `第 ${highlight.page} 页 · `}
                      {formatDate(highlight.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeHighlight(highlight.id)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    title="删除"
                  >
                    <Trash2 className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            ))}

            {highlights.length === 0 && (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">✨</span>
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  还没有标注
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                  选中文本可以添加高亮标注
                </p>
              </div>
            )}
          </div>
        )}

        {/* 统计标签页 */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalBooks}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    总书籍数
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.completedBooks}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    已完成
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {Math.floor(stats.totalReadingTime / 3600)}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    阅读小时数
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                  <Bookmark className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalBookmarks}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    书签数
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-500/10'}`}>
                  <span className="text-3xl">✨</span>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalHighlights}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    标注数
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {books.length > 0 ? Math.round(books.reduce((sum, b) => sum + b.progress, 0) / books.length) : 0}%
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    平均进度
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
