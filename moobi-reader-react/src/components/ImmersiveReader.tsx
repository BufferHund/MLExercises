import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, Moon, Sun, Bookmark, ZoomIn, ZoomOut, Search, Highlighter } from 'lucide-react';
import PdfReader from './PdfReader';
import EpubReader from './EpubReader';
import TextReader from './TextReader';

interface ImmersiveReaderProps {
  file: File;
  fileName: string;
  fileType: string;
  onClose: () => void;
}

interface BookData {
  fileName: string;
  fileType: string;
  fileSize: number;
  lastOpened: number;
  currentPage?: number;
  totalPages?: number;
  progress: number;
  readingTime: number;
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

export default function ImmersiveReader({ file, fileName, fileType, onClose }: ImmersiveReaderProps) {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // 新增功能状态
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkColor, setBookmarkColor] = useState('#FFD700');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef(Date.now());
  const readingTimeInterval = useRef<NodeJS.Timeout | null>(null);

  // 保存阅读历史
  const saveReadingHistory = useCallback(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);

    const bookData: BookData = {
      fileName,
      fileType,
      fileSize: file.size,
      lastOpened: Date.now(),
      currentPage: fileType === 'pdf' ? currentPage : undefined,
      totalPages: fileType === 'pdf' ? totalPages : undefined,
      progress,
      readingTime: elapsed,
      addedDate: Date.now(),
    };

    // 获取现有书架数据
    const saved = localStorage.getItem('moobi-bookshelf');
    let bookshelf: BookData[] = [];
    if (saved) {
      try {
        bookshelf = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load bookshelf:', e);
      }
    }

    // 更新或添加当前书籍
    const existingIndex = bookshelf.findIndex(b => b.fileName === fileName);
    if (existingIndex >= 0) {
      // 累加阅读时间
      bookData.readingTime += bookshelf[existingIndex].readingTime || 0;
      bookData.addedDate = bookshelf[existingIndex].addedDate;
      bookshelf[existingIndex] = bookData;
    } else {
      bookshelf.unshift(bookData);
    }

    localStorage.setItem('moobi-bookshelf', JSON.stringify(bookshelf));
    console.log('📚 Reading history saved:', bookData);
  }, [fileName, fileType, file.size, currentPage, totalPages, progress]);

  // 阅读时间追踪
  useEffect(() => {
    sessionStartTime.current = Date.now();

    // 每30秒保存一次进度
    const interval = setInterval(() => {
      saveReadingHistory();
    }, 30000);

    readingTimeInterval.current = interval;

    // 组件卸载时保存
    return () => {
      if (readingTimeInterval.current) {
        clearInterval(readingTimeInterval.current);
      }
      saveReadingHistory();
    };
  }, [saveReadingHistory]);

  // 加载书签
  useEffect(() => {
    const saved = localStorage.getItem('moobi-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }
  }, []);

  // 保存书签
  const saveBookmarks = (newBookmarks: BookmarkData[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('moobi-bookmarks', JSON.stringify(newBookmarks));
  };

  // 添加书签 - 显示对话框
  const handleAddBookmark = () => {
    setShowBookmarkDialog(true);
    setBookmarkNote('');
    setBookmarkColor('#FFD700');
  };

  // 保存书签（带笔记）
  const saveBookmarkWithNote = () => {
    const bookmark: BookmarkData = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName,
      page: fileType === 'pdf' ? currentPage : undefined,
      progress,
      timestamp: Date.now(),
      note: bookmarkNote.trim() || undefined,
      color: bookmarkColor,
    };

    const newBookmarks = [bookmark, ...bookmarks];
    saveBookmarks(newBookmarks);

    // 同时保存到全局书签列表
    const globalBookmarks = localStorage.getItem('moobi-all-bookmarks');
    let allBookmarks: BookmarkData[] = [];
    if (globalBookmarks) {
      try {
        allBookmarks = JSON.parse(globalBookmarks);
      } catch (e) {
        console.error('Failed to load global bookmarks:', e);
      }
    }
    allBookmarks.unshift(bookmark);
    localStorage.setItem('moobi-all-bookmarks', JSON.stringify(allBookmarks));

    console.log('📌 Bookmark saved with note:', bookmark);
    setShowBookmarkDialog(false);
  };

  // 加载高亮
  const [highlights, setHighlights] = useState<HighlightData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('moobi-all-highlights');
    if (saved) {
      try {
        setHighlights(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load highlights:', e);
      }
    }
  }, []);

  // 保存高亮
  const saveHighlight = (text: string, color: string) => {
    const highlight: HighlightData = {
      id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName,
      page: fileType === 'pdf' ? currentPage : undefined,
      text,
      color,
      timestamp: Date.now(),
    };

    const newHighlights = [highlight, ...highlights];
    setHighlights(newHighlights);
    localStorage.setItem('moobi-all-highlights', JSON.stringify(newHighlights));

    console.log('🖍️ Highlight saved:', highlight);
    setShowHighlightMenu(false);
    setSelectedText('');
  };

  // 文本选择处理
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        setSelectedText(text);
        setShowHighlightMenu(true);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    };
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果在输入框中，不处理
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrevPage();
          console.log('⌨️ Keyboard: Previous page');
          break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // 空格键
          e.preventDefault();
          handleNextPage();
          console.log('⌨️ Keyboard: Next page');
          break;
        case 'Home':
          e.preventDefault();
          if (fileType === 'pdf' && (window as any).pdfReaderControls) {
            (window as any).pdfReaderControls.goToPage(1);
          }
          console.log('⌨️ Keyboard: Go to first page');
          break;
        case 'End':
          e.preventDefault();
          if (fileType === 'pdf' && (window as any).pdfReaderControls && totalPages > 0) {
            (window as any).pdfReaderControls.goToPage(totalPages);
          }
          console.log('⌨️ Keyboard: Go to last page');
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearch(!showSearch);
            console.log('⌨️ Keyboard: Toggle search (Ctrl+F)');
          } else {
            e.preventDefault();
            toggleFullscreen();
            console.log('⌨️ Keyboard: Toggle fullscreen (F)');
          }
          break;
        case 'Escape':
          if (showSearch) {
            setShowSearch(false);
          } else if (showBookmarkDialog) {
            setShowBookmarkDialog(false);
          } else if (showHighlightMenu) {
            setShowHighlightMenu(false);
          } else if (showSettings) {
            setShowSettings(false);
          } else if (showBookmarks) {
            setShowBookmarks(false);
          } else if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileType, totalPages, isFullscreen, showSettings, showBookmarks, showSearch, showBookmarkDialog, showHighlightMenu]);

  // 触摸/滑动支持
  useEffect(() => {
    const container = readerContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // 确保是水平滑动（而不是垂直滚动）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // 向右滑动 = 上一页
          handlePrevPage();
          console.log('👆 Swipe: Previous page');
        } else {
          // 向左滑动 = 下一页
          handleNextPage();
          console.log('👆 Swipe: Next page');
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // 自动隐藏控制栏
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (showControls && isFullscreen) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleNextPage = () => {
    if (fileType === 'pdf' && (window as any).pdfReaderControls) {
      (window as any).pdfReaderControls.nextPage();
    } else if (fileType === 'epub' && (window as any).epubReaderControls) {
      (window as any).epubReaderControls.nextPage();
    } else {
      setProgress(Math.min(100, progress + 5));
    }
  };

  const handlePrevPage = () => {
    if (fileType === 'pdf' && (window as any).pdfReaderControls) {
      (window as any).pdfReaderControls.prevPage();
    } else if (fileType === 'epub' && (window as any).epubReaderControls) {
      (window as any).epubReaderControls.prevPage();
    } else {
      setProgress(Math.max(0, progress - 5));
    }
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handlePageChange = (current: number, total: number) => {
    setCurrentPage(current);
    setTotalPages(total);
    const calculatedProgress = Math.round((current / total) * 100);
    setProgress(calculatedProgress);
  };

  const renderReader = () => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return (
          <PdfReader
            file={file}
            theme={theme}
            zoom={pdfZoom}
            onPageChange={handlePageChange}
            onProgressChange={handleProgressChange}
          />
        );
      case 'epub':
        return (
          <EpubReader
            file={file}
            fontSize={fontSize}
            theme={theme}
            onProgressChange={handleProgressChange}
          />
        );
      case 'txt':
      case 'md':
        return (
          <TextReader
            file={file}
            fontSize={fontSize}
            theme={theme}
            onProgressChange={handleProgressChange}
          />
        );
      default:
        return (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 ${
              theme === 'dark' ? 'bg-white/5' : 'bg-gray-900/5'
            }`}>
              <span className="text-4xl">📄</span>
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              暂不支持此格式
            </h3>
            <p className={`text-base ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
              {fileType.toUpperCase()} 格式的阅读功能即将推出
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
      onMouseMove={handleMouseMove}
    >
      {/* 顶部控制栏 */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className={`${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-gray-50/95 backdrop-blur-xl'} border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-900/10'}`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* 左侧 */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="关闭阅读器 (ESC)"
              >
                <X className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div className="min-w-0">
                <h3 className={`font-semibold text-sm truncate max-w-[300px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {fileName}
                </h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  {fileType.toUpperCase()} 格式
                  {fileType === 'pdf' && totalPages > 0 && ` · 第 ${currentPage}/${totalPages} 页`}
                </p>
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-900" />
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className={`px-4 py-2 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'} rounded-xl text-sm font-medium transition-colors`}
                title="全屏阅读 (F)"
              >
                {isFullscreen ? '退出全屏' : '全屏阅读'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主阅读区域 */}
      <div ref={readerContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12">
          {renderReader()}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className={`${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-gray-50/95 backdrop-blur-xl'} border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-900/10'}`}>
          {/* 进度条 */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-4">
              <span className={`text-xs font-semibold min-w-[3rem] text-right ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                {progress}%
              </span>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-xs font-semibold min-w-[3rem] ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                100%
              </span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between px-6 py-4">
            {/* 导航控制 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="上一页 (←/PageUp)"
              >
                <ChevronLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <button
                onClick={handleNextPage}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="下一页 (→/PageDown/空格)"
              >
                <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>

            {/* 功能控制 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors ${showSearch ? (theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10') : ''}`}
                title="搜索 (Ctrl+F)"
              >
                <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>

              <button
                onClick={handleAddBookmark}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="添加书签"
              >
                <Bookmark className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>

              <button
                onClick={() => {
                  if (selectedText) {
                    setShowHighlightMenu(true);
                  } else {
                    alert('请先选择要高亮的文本');
                  }
                }}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors ${showHighlightMenu ? (theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10') : ''}`}
                title="高亮标注"
              >
                <Highlighter className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>

              {/* EPUB/TXT字体控制 */}
              {(fileType === 'epub' || fileType === 'txt' || fileType === 'md') && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'}`}>
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-white hover:text-white/70' : 'text-gray-900 hover:text-gray-600'}`}
                    title="减小字号"
                  >
                    A-
                  </button>
                  <span className={`text-xs font-semibold min-w-[2rem] text-center ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                    className={`text-lg font-bold transition-colors ${theme === 'dark' ? 'text-white hover:text-white/70' : 'text-gray-900 hover:text-gray-600'}`}
                    title="增大字号"
                  >
                    A+
                  </button>
                </div>
              )}

              {/* PDF缩放控制 */}
              {fileType === 'pdf' && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'}`}>
                  <button
                    onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))}
                    className={`p-1 transition-colors ${theme === 'dark' ? 'text-white hover:text-white/70' : 'text-gray-900 hover:text-gray-600'}`}
                    title="缩小"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-semibold min-w-[3rem] text-center ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    {pdfZoom}%
                  </span>
                  <button
                    onClick={() => setPdfZoom(Math.min(200, pdfZoom + 10))}
                    className={`p-1 transition-colors ${theme === 'dark' ? 'text-white hover:text-white/70' : 'text-gray-900 hover:text-gray-600'}`}
                    title="放大"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors ${showSettings ? (theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10') : ''}`}
                title="设置"
              >
                <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              阅读设置
            </h3>

            <div className="space-y-6">
              {/* 主题设置 */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  主题
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-gray-900 text-white'
                        : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    浅色
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    深色
                  </button>
                </div>
              </div>

              {/* 字体大小 (EPUB/TXT) */}
              {(fileType === 'epub' || fileType === 'txt' || fileType === 'md') && (
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                    字体大小: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* PDF缩放 */}
              {fileType === 'pdf' && (
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                    PDF缩放: {pdfZoom}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={pdfZoom}
                    onChange={(e) => setPdfZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* 快捷键说明 */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  快捷键
                </label>
                <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                  <p>← / PageUp: 上一页</p>
                  <p>→ / PageDown / 空格: 下一页</p>
                  <p>Home: 第一页</p>
                  <p>End: 最后一页</p>
                  <p>F: 全屏切换</p>
                  <p>Ctrl+F: 搜索</p>
                  <p>ESC: 退出全屏/关闭面板</p>
                  <p>滑动: 左右滑动翻页</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-medium transition-colors ${
                theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 书签对话框 */}
      {showBookmarkDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowBookmarkDialog(false)}>
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              添加书签
            </h3>

            <div className="space-y-4">
              <div>
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  {fileName}
                </p>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'}`}>
                  {fileType === 'pdf' ? `第 ${currentPage}/${totalPages} 页` : `进度: ${progress}%`}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  书签笔记 (可选)
                </label>
                <textarea
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="记录你的想法..."
                  className={`w-full px-4 py-3 rounded-xl border resize-none ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  书签颜色
                </label>
                <div className="flex gap-2">
                  {['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBookmarkColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        bookmarkColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookmarkDialog(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                取消
              </button>
              <button
                onClick={saveBookmarkWithNote}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all"
              >
                保存书签
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 高亮菜单 */}
      {showHighlightMenu && selectedText && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowHighlightMenu(false)}>
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              高亮标注
            </h3>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  选中的文本:
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} line-clamp-3`}>
                  {selectedText}
                </p>
              </div>

              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  选择颜色
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['#FFFF00', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFA07A', '#98D8C8'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setHighlightColor(color)}
                      className={`h-12 rounded-xl transition-all ${
                        highlightColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHighlightMenu(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                取消
              </button>
              <button
                onClick={() => saveHighlight(selectedText, highlightColor)}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all"
              >
                保存高亮
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 搜索面板 */}
      {showSearch && (
        <div className={`fixed top-20 right-6 z-[60] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-4 w-80`}>
          <div className="flex items-center gap-2 mb-3">
            <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
            <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              搜索文档
            </h3>
            <button
              onClick={() => setShowSearch(false)}
              className={`ml-auto p-1 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入搜索关键词..."
            className={`w-full px-4 py-2 rounded-xl border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-primary text-sm`}
            autoFocus
          />

          {searchQuery && (
            <div className="mt-3">
              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} mb-2`}>
                搜索功能将在未来版本中完善
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                目前可使用浏览器内置搜索 (Ctrl+F)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
