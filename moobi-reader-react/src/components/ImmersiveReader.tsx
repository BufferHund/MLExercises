import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, Moon, Sun, Bookmark, ZoomIn, ZoomOut } from 'lucide-react';
import PdfReader from './PdfReader';
import EpubReader from './EpubReader';
import TextReader from './TextReader';

interface ImmersiveReaderProps {
  file: File;
  fileName: string;
  fileType: string;
  onClose: () => void;
}

interface BookmarkData {
  fileName: string;
  page?: number;
  progress: number;
  timestamp: number;
}

export default function ImmersiveReader({ file, fileName, fileType, onClose }: ImmersiveReaderProps) {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfZoom, setPdfZoom] = useState(100); // PDF缩放百分比
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const readerContainerRef = useRef<HTMLDivElement>(null);

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

  // 添加书签
  const handleAddBookmark = () => {
    const bookmark: BookmarkData = {
      fileName,
      page: fileType === 'pdf' ? currentPage : undefined,
      progress,
      timestamp: Date.now(),
    };

    const newBookmarks = [bookmark, ...bookmarks.filter(b => b.fileName !== fileName)];
    saveBookmarks(newBookmarks);

    console.log('📌 Bookmark added:', bookmark);
    alert(`书签已添加！\n文件: ${fileName}\n${fileType === 'pdf' ? `页码: ${currentPage}/${totalPages}` : `进度: ${progress}%`}`);
  };

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
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
            console.log('⌨️ Keyboard: Toggle fullscreen');
          }
          break;
        case 'Escape':
          if (showSettings) {
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
  }, [fileType, totalPages, isFullscreen, showSettings, showBookmarks]);

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
                onClick={handleAddBookmark}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="添加书签"
              >
                <Bookmark className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
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
    </div>
  );
}
