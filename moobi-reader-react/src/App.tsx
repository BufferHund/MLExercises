import { useState, useEffect } from 'react';
import { Bookmark, Search, TrendingUp, Upload, Library } from 'lucide-react';
import { useBookStore } from './stores/useBookStore';
import { bookStorage, type StoredBook } from './utils/bookStorage';
import WelcomeScreen from './components/WelcomeScreen';
import FileUploader from './components/FileUploader';
import RecentBooks from './components/RecentBooks';
import ImmersiveReader from './components/ImmersiveReader';
import Bookshelf from './components/Bookshelf';
import type { Book } from './types';

function App() {
  const { bookshelf } = useBookStore();
  const [currentFile, setCurrentFile] = useState<{ file: File; name: string; type: string; bookId?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [view, setView] = useState<'home' | 'bookshelf'>('home');
  const [storedBooks, setStoredBooks] = useState<StoredBook[]>([]);

  // 初始化 IndexedDB 并加载已保存的书籍
  useEffect(() => {
    const loadBooks = async () => {
      try {
        await bookStorage.init();
        const books = await bookStorage.getAllBooks();
        setStoredBooks(books);
      } catch (error) {
        console.error('Failed to load books from storage:', error);
      }
    };
    loadBooks();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    try {
      // 保存到 IndexedDB
      const bookId = await bookStorage.saveBook(file);

      // 重新加载书籍列表
      const books = await bookStorage.getAllBooks();
      setStoredBooks(books);

      // 打开书籍
      setCurrentFile({ file, name: file.name, type: fileType, bookId });
    } catch (error) {
      console.error('Failed to save book:', error);
      // 即使保存失败，仍然可以打开书籍
      setCurrentFile({ file, name: file.name, type: fileType });
    }
  };

  const handleBookClick = async (book: Book) => {
    // 尝试从 IndexedDB 读取书籍
    try {
      // 查找匹配的存储书籍（通过文件名匹配）
      const storedBook = storedBooks.find(sb => sb.fileName === book.title);

      if (storedBook) {
        // 从 IndexedDB 读取完整的书籍数据
        const fullBook = await bookStorage.getBook(storedBook.id);
        if (fullBook) {
          // 更新最后打开时间
          await bookStorage.updateLastOpened(storedBook.id);

          // 创建 File 对象
          const file = new File([fullBook.file], fullBook.fileName, {
            type: fullBook.file.type,
          });

          setCurrentFile({
            file,
            name: fullBook.fileName,
            type: fullBook.fileType,
            bookId: fullBook.id,
          });
          return;
        }
      }

      // 如果找不到，显示提示
      alert('无法找到书籍文件。请重新上传该书籍。');
    } catch (error) {
      console.error('Failed to load book:', error);
      alert('加载书籍失败，请重试。');
    }
  };

  const handleCloseReader = () => {
    setCurrentFile(null);
  };

  // 如果正在阅读，显示沉浸式阅读器
  if (currentFile) {
    return (
      <ImmersiveReader
        file={currentFile.file}
        fileName={currentFile.name}
        fileType={currentFile.type}
        onClose={handleCloseReader}
      />
    );
  }

  // 如果在书架视图
  if (view === 'bookshelf') {
    return <Bookshelf onOpenFile={handleFileSelect} onBack={() => setView('home')} theme="dark" />;
  }

  // 否则显示主界面
  return (
    <div
      className="min-h-screen relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖放覆盖层 */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-xl animate-scale-in">
          <div className="glass rounded-5xl p-16 text-center animate-pulse-soft">
            <Upload className="w-24 h-24 mx-auto mb-6 text-white" />
            <h3 className="text-3xl font-bold text-white mb-2">拖放文件到这里</h3>
            <p className="text-white/70 text-lg">支持多种电子书格式</p>
          </div>
        </div>
      )}

      {/* 主界面 */}
      <div className="flex items-center justify-center min-h-screen p-6 animate-slide-up">
        <div className="glass rounded-4xl p-14 max-w-3xl w-full shadow-glass-lg">
          {/* 欢迎界面 */}
          <WelcomeScreen />

          {/* 文件上传 */}
          <FileUploader onFileSelect={handleFileSelect} />

          {/* 最近阅读 */}
          <RecentBooks books={bookshelf} onBookClick={handleBookClick} />

          {/* 功能卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Library, title: '书架管理', desc: '自动保存历史', color: 'from-primary to-primary-light', action: () => setView('bookshelf') },
              { icon: Bookmark, title: '书签笔记', desc: '标记重要内容', color: 'from-accent-pink to-accent-orange', action: () => setView('bookshelf') },
              { icon: TrendingUp, title: '阅读统计', desc: '追踪进度', color: 'from-accent-green to-accent-teal', action: () => setView('bookshelf') },
              { icon: Search, title: '全文搜索', desc: '快速查找', color: 'from-secondary to-accent-purple', action: () => alert('全文搜索功能在阅读界面中使用') },
            ].map((feature, i) => (
              <div
                key={i}
                onClick={feature.action}
                className="group text-center p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all duration-300 ease-smooth hover:scale-105 hover:shadow-soft-lg cursor-pointer border border-white/10 hover:border-white/20 animate-scale-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-soft-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h4 className="font-bold text-base mb-2 text-white">
                  {feature.title}
                </h4>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
