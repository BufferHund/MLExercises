import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, Bookmark, ZoomIn, ZoomOut, Search, Highlighter, Sun, Moon } from 'lucide-react';
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
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia' | 'green' | 'blue'>('light');
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'elegant' | 'a4' | 'full'>('elegant');
  const [pageMode, setPageMode] = useState<'single' | 'double'>('single');
  const [pdfDisplayMode, setPdfDisplayMode] = useState<'native' | 'custom'>('native'); // PDF显示模式

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
        case 'z':
        case 'Z':
          e.preventDefault();
          setZenMode(!zenMode);
          console.log('⌨️ Keyboard: Toggle Zen mode');
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

  // 滚轮翻页支持 - 仅用于自定义PDF/EPUB渲染模式
  useEffect(() => {
    // 原生PDF模式不需要滚轮翻页
    if (fileType === 'pdf' && pdfDisplayMode === 'native') return;

    const container = readerContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 如果正在输入，不处理
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const delta = e.deltaY;

      // 滚动阈值：需要一定的滚动量才触发翻页
      if (Math.abs(delta) > 50) {
        if (delta > 0) {
          // 向下滚动 = 下一页
          handleNextPage();
        } else {
          // 向上滚动 = 上一页
          handlePrevPage();
        }
      }
    };

    container.addEventListener('wheel', handleWheel);

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [fileType, pdfDisplayMode]);

  // 自动隐藏控制栏
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (showControls && !showSettings && !showBookmarkDialog && !showHighlightMenu && !showSearch) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls, showSettings, showBookmarkDialog, showHighlightMenu, showSearch]);

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

  // 获取主题颜色 - 纸张颜色和背景颜色分离
  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-gray-100', // 浅灰背景
          paper: 'bg-white', // 白纸张
          text: 'text-gray-900',
          border: 'border-gray-900/10',
          controlBg: 'bg-white/95',
          hover: 'hover:bg-gray-900/10'
        };
      case 'dark':
        return {
          bg: 'bg-gray-800', // 深灰背景（不是黑色）
          paper: 'bg-gray-900', // 更深的纸张
          text: 'text-white',
          border: 'border-white/10',
          controlBg: 'bg-gray-900/95',
          hover: 'hover:bg-white/10'
        };
      case 'sepia':
        return {
          bg: 'bg-[#e5d5b7]', // 浅棕色背景
          paper: 'bg-[#f4ecd8]', // 更亮的米色纸张
          text: 'text-[#5c4a2f]',
          border: 'border-[#5c4a2f]/10',
          controlBg: 'bg-[#f4ecd8]/95',
          hover: 'hover:bg-[#5c4a2f]/10'
        };
      case 'green':
        return {
          bg: 'bg-[#b8d4b8]', // 浅绿色背景
          paper: 'bg-[#cce8cc]', // 更亮的绿色纸张
          text: 'text-[#2d4a2d]',
          border: 'border-[#2d4a2d]/10',
          controlBg: 'bg-[#cce8cc]/95',
          hover: 'hover:bg-[#2d4a2d]/10'
        };
      case 'blue':
        return {
          bg: 'bg-[#c5e3f6]', // 浅蓝色背景
          paper: 'bg-[#e0f2ff]', // 更亮的蓝色纸张
          text: 'text-[#1e3a5f]',
          border: 'border-[#1e3a5f]/10',
          controlBg: 'bg-[#e0f2ff]/95',
          hover: 'hover:bg-[#1e3a5f]/10'
        };
      default:
        return {
          bg: 'bg-gray-800',
          paper: 'bg-gray-900',
          text: 'text-white',
          border: 'border-white/10',
          controlBg: 'bg-gray-900/95',
          hover: 'hover:bg-white/10'
        };
    }
  };

  // 获取布局宽度 - 控制栏隐藏时使用更大宽度
  const getLayoutWidth = () => {
    const isExpanded = !showControls;

    switch (layoutMode) {
      case 'elegant':
        return isExpanded ? 'max-w-[1600px]' : 'max-w-7xl'; // 控制栏隐藏时更宽
      case 'a4':
        return 'max-w-[210mm]'; // A4纸张模式固定
      case 'full':
        return 'max-w-full'; // 全宽模式
      default:
        return isExpanded ? 'max-w-[1600px]' : 'max-w-7xl';
    }
  };

  const themeColors = getThemeColors();

  // 记忆化PDF URL，避免重复创建导致重载
  const pdfUrl = useMemo(() => {
    if (fileType === 'pdf' && pdfDisplayMode === 'native') {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, fileType, pdfDisplayMode]);

  // 清理PDF URL
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const renderReader = () => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        if (pdfDisplayMode === 'native') {
          // 使用浏览器原生PDF查看器
          // 计算高度：工具栏显示时减去控制栏高度，隐藏时占满全屏
          const height = showControls ? 'calc(100vh - 180px)' : '100vh';

          return (
            <iframe
              src={pdfUrl || ''}
              className="w-full border-0 transition-all duration-300"
              style={{ height }}
              title={fileName}
            />
          );
        } else {
          // 使用自定义PDF渲染组件
          return (
            <PdfReader
              file={file}
              theme={theme}
              zoom={pdfZoom}
              onPageChange={handlePageChange}
              onProgressChange={handleProgressChange}
            />
          );
        }
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
              <span className="text-4xl">?</span>
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
      className={`fixed inset-0 z-50 flex flex-col ${themeColors.bg} transition-colors duration-300`}
      onMouseMove={handleMouseMove}
    >
      {/* 顶部控制栏 */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          zenMode ? 'hidden' : (showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0')
        }`}
      >
        <div className={`${themeColors.controlBg} backdrop-blur-xl border-b ${themeColors.border}`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* 左侧 */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`p-2 ${themeColors.hover} rounded-xl transition-colors`}
                title="关闭阅读器 (ESC)"
              >
                <X className={`w-5 h-5 ${themeColors.text}`} />
              </button>
              <div className="min-w-0">
                <h3 className={`font-semibold text-sm truncate max-w-[300px] ${themeColors.text}`}>
                  {fileName}
                </h3>
                <p className={`text-xs ${themeColors.text} opacity-60`}>
                  {fileType.toUpperCase()} 格式
                  {fileType === 'pdf' && totalPages > 0 && ` · 第 ${currentPage}/${totalPages} 页`}
                </p>
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="flex items-center gap-2">
              {/* 主题快速切换 - 白天/黑夜 */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2.5 ${themeColors.hover} rounded-xl transition-colors`}
                title="切换白天/黑夜模式"
              >
                {theme === 'dark' ? (
                  <Moon className={`w-5 h-5 ${themeColors.text}`} />
                ) : (
                  <Sun className={`w-5 h-5 ${themeColors.text}`} />
                )}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 ${themeColors.hover} rounded-xl transition-colors`}
                title="打开设置"
              >
                <Settings className={`w-5 h-5 ${themeColors.text}`} />
              </button>
              <button
                onClick={toggleFullscreen}
                className={`px-4 py-2 ${themeColors.hover} ${themeColors.text} rounded-xl text-sm font-medium transition-colors`}
                title="全屏阅读 (F)"
              >
                {isFullscreen ? '退出全屏' : '全屏阅读'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主阅读区域 */}
      <div ref={readerContainerRef} className={`flex-1 overflow-y-auto flex items-center justify-center ${themeColors.bg} ${themeColors.text} transition-colors duration-300`}>
        {/* 原生PDF模式 - 完全占满 */}
        {fileType === 'pdf' && pdfDisplayMode === 'native' ? (
          <div className="w-full h-full">
            {renderReader()}
          </div>
        ) : (
          /* 内容容器 - 居中显示，圆角 */
          <div className={`${getLayoutWidth()} w-full mx-auto transition-none overflow-hidden rounded-2xl`}>
            {renderReader()}
          </div>
        )}
      </div>

      {/* 底部控制栏 */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          zenMode ? 'hidden' : (showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0')
        }`}
      >
        <div className={`${themeColors.controlBg} backdrop-blur-xl border-t ${themeColors.border}`}>
          {/* 进度条 */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-4">
              <span className={`text-xs font-semibold min-w-[3rem] text-right ${themeColors.text} opacity-70`}>
                {progress}%
              </span>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${themeColors.hover}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-xs font-semibold min-w-[3rem] ${themeColors.text} opacity-70`}>
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
                className={`p-2.5 ${themeColors.hover} rounded-xl transition-colors ${showSearch ? themeColors.hover : ''}`}
                title="搜索 (Ctrl+F)"
              >
                <Search className={`w-5 h-5 ${themeColors.text}`} />
              </button>

              <button
                onClick={handleAddBookmark}
                className={`p-2.5 ${themeColors.hover} rounded-xl transition-colors`}
                title="添加书签"
              >
                <Bookmark className={`w-5 h-5 ${themeColors.text}`} />
              </button>

              <button
                onClick={() => {
                  if (selectedText) {
                    setShowHighlightMenu(true);
                  } else {
                    console.log('请先选择要高亮的文本');
                  }
                }}
                className={`p-2.5 ${themeColors.hover} rounded-xl transition-colors ${showHighlightMenu ? themeColors.hover : ''}`}
                title="高亮标注"
              >
                <Highlighter className={`w-5 h-5 ${themeColors.text}`} />
              </button>

              {/* EPUB/TXT字体控制 - 12、16、20、24、28 */}
              {(fileType === 'epub' || fileType === 'txt' || fileType === 'md') && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${themeColors.hover}`}>
                  <button
                    onClick={() => setFontSize(12)}
                    className={`px-2 py-1 text-xs font-medium transition-colors rounded ${fontSize === 12 ? 'bg-black/20' : ''} ${themeColors.text}`}
                    title="最小"
                  >
                    12
                  </button>
                  <button
                    onClick={() => setFontSize(16)}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded ${fontSize === 16 ? 'bg-black/20' : ''} ${themeColors.text}`}
                    title="小"
                  >
                    16
                  </button>
                  <button
                    onClick={() => setFontSize(20)}
                    className={`px-2 py-1 text-base font-medium transition-colors rounded ${fontSize === 20 ? 'bg-black/20' : ''} ${themeColors.text}`}
                    title="中"
                  >
                    20
                  </button>
                  <button
                    onClick={() => setFontSize(24)}
                    className={`px-2 py-1 text-lg font-medium transition-colors rounded ${fontSize === 24 ? 'bg-black/20' : ''} ${themeColors.text}`}
                    title="大"
                  >
                    24
                  </button>
                  <button
                    onClick={() => setFontSize(28)}
                    className={`px-2 py-1 text-xl font-medium transition-colors rounded ${fontSize === 28 ? 'bg-black/20' : ''} ${themeColors.text}`}
                    title="最大"
                  >
                    28
                  </button>
                </div>
              )}

              {/* PDF缩放控制 */}
              {fileType === 'pdf' && pdfDisplayMode === 'custom' && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${themeColors.hover}`}>
                  <button
                    onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))}
                    className={`p-1 transition-colors ${themeColors.text}`}
                    title="缩小"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-semibold min-w-[3rem] text-center ${themeColors.text} opacity-70`}>
                    {pdfZoom}%
                  </span>
                  <button
                    onClick={() => setPdfZoom(Math.min(200, pdfZoom + 10))}
                    className={`p-1 transition-colors ${themeColors.text}`}
                    title="放大"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 ${themeColors.hover} rounded-xl transition-colors ${showSettings ? themeColors.hover : ''}`}
                title="设置"
              >
                <Settings className={`w-5 h-5 ${themeColors.text}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 常驻浮动控制栏 - 右下角 - 只在主控制栏隐藏时显示 */}
      {!zenMode && !showControls && (
        <div className={`fixed bottom-6 right-6 z-50 ${themeColors.controlBg} backdrop-blur-xl rounded-2xl shadow-2xl border ${themeColors.border} p-3 transition-all duration-300`}>
          <div className="flex flex-col gap-2">
            {/* 翻页控制 */}
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                className={`p-2 ${themeColors.hover} rounded-xl transition-colors`}
                title="上一页 (←)"
              >
                <ChevronLeft className={`w-4 h-4 ${themeColors.text}`} />
              </button>
              <button
                onClick={handleNextPage}
                className={`p-2 ${themeColors.hover} rounded-xl transition-colors`}
                title="下一页 (→)"
              >
                <ChevronRight className={`w-4 h-4 ${themeColors.text}`} />
              </button>
            </div>

            {/* 分隔线 */}
            <div className={`h-px ${themeColors.border}`} />

            {/* 常用功能 */}
            <button
              onClick={handleAddBookmark}
              className={`p-2 ${themeColors.hover} rounded-xl transition-colors`}
              title="添加书签"
            >
              <Bookmark className={`w-4 h-4 ${themeColors.text}`} />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 ${themeColors.hover} rounded-xl transition-colors`}
              title="设置"
            >
              <Settings className={`w-4 h-4 ${themeColors.text}`} />
            </button>
          </div>
        </div>
      )}

      {/* PDF显示模式切换按钮 - 左下角 */}
      {fileType === 'pdf' && !zenMode && (
        <div className={`fixed bottom-6 left-6 z-50 ${themeColors.controlBg} backdrop-blur-xl rounded-2xl shadow-2xl border ${themeColors.border} p-3 transition-all duration-300`}>
          <button
            onClick={() => setPdfDisplayMode(pdfDisplayMode === 'native' ? 'custom' : 'native')}
            className={`p-2 ${themeColors.hover} rounded-xl transition-colors flex items-center gap-2`}
            title={pdfDisplayMode === 'native' ? '切换到自定义渲染' : '切换到浏览器原生'}
          >
            <span className={`text-xs font-medium ${themeColors.text}`}>
              {pdfDisplayMode === 'native' ? '原生' : '自定义'}
            </span>
          </button>
        </div>
      )}

      {/* Zen 模式退出提示 - 右上角低调显示 */}
      {zenMode && (
        <button
          onClick={() => setZenMode(false)}
          className="fixed top-4 right-4 z-[60] px-3 py-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white/60 hover:text-white/90 rounded-lg text-xs transition-all"
          title="退出 Zen 模式 (Z)"
        >
          退出
        </button>
      )}

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
              {/* 主题颜色 */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  阅读主题
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-gray-900 text-white ring-2 ring-primary'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    浅色
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-900 text-white ring-2 ring-primary'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    深色
                  </button>
                  <button
                    onClick={() => setTheme('sepia')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      theme === 'sepia'
                        ? 'bg-[#f4ecd8] text-[#5c4a2f] ring-2 ring-primary'
                        : 'bg-[#f4ecd8] text-[#5c4a2f] hover:bg-[#ebe2ca]'
                    }`}
                  >
                    米色
                  </button>
                  <button
                    onClick={() => setTheme('green')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      theme === 'green'
                        ? 'bg-[#cce8cc] text-[#2d4a2d] ring-2 ring-primary'
                        : 'bg-[#cce8cc] text-[#2d4a2d] hover:bg-[#b8deb8]'
                    }`}
                  >
                    绿色
                  </button>
                  <button
                    onClick={() => setTheme('blue')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      theme === 'blue'
                        ? 'bg-[#e0f2ff] text-[#1e3a5f] ring-2 ring-primary'
                        : 'bg-[#e0f2ff] text-[#1e3a5f] hover:bg-[#d0e8f7]'
                    }`}
                  >
                    蓝色
                  </button>
                </div>
              </div>

              {/* 布局模式 - PDF才有A4选项 */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  布局模式
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayoutMode('elegant')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      layoutMode === 'elegant'
                        ? 'bg-gradient-to-r from-primary to-secondary !text-white'
                        : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    优雅
                  </button>
                  {fileType === 'pdf' && (
                    <button
                      onClick={() => setLayoutMode('a4')}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        layoutMode === 'a4'
                          ? 'bg-gradient-to-r from-primary to-secondary !text-white'
                          : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      A4
                    </button>
                  )}
                  <button
                    onClick={() => setLayoutMode('full')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      layoutMode === 'full'
                        ? 'bg-gradient-to-r from-primary to-secondary !text-white'
                        : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    全屏
                  </button>
                </div>
              </div>

              {/* 页面模式 (PDF) */}
              {fileType === 'pdf' && (
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                    页面模式
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPageMode('single')}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        pageMode === 'single'
                          ? 'bg-gradient-to-r from-primary to-secondary !text-white'
                          : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      单页
                    </button>
                    <button
                      onClick={() => setPageMode('double')}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        pageMode === 'double'
                          ? 'bg-gradient-to-r from-primary to-secondary !text-white'
                          : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      双页
                    </button>
                  </div>
                </div>
              )}

              {/* Zen模式 */}
              <div>
                <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                  Zen 模式
                </label>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    zenMode
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {zenMode ? '已启用 Zen 模式' : '启用 Zen 模式 (Z)'}
                </button>
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  隐藏所有控制栏，专注阅读
                </p>
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
                  <p>Home: 第一页 | End: 最后一页</p>
                  <p>F: 全屏切换 | Z: Zen 模式</p>
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
