import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, Moon, Sun, Bookmark } from 'lucide-react';
import PdfReader from './PdfReader';
import EpubReader from './EpubReader';
import TextReader from './TextReader';

interface ImmersiveReaderProps {
  file: File;
  fileName: string;
  fileType: string;
  onClose: () => void;
}

export default function ImmersiveReader({ file, fileName, fileType, onClose }: ImmersiveReaderProps) {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(0);

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
                title="关闭阅读器"
              >
                <X className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div className="min-w-0">
                <h3 className={`font-semibold text-sm truncate max-w-[300px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {fileName}
                </h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  {fileType.toUpperCase()} 格式
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
              >
                {isFullscreen ? '退出全屏' : '全屏阅读'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主阅读区域 */}
      <div className="flex-1 overflow-y-auto">
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
                title="上一页"
              >
                <ChevronLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <button
                onClick={handleNextPage}
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="下一页"
              >
                <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>

            {/* 功能控制 */}
            <div className="flex items-center gap-3">
              <button
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="添加书签"
              >
                <Bookmark className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>

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

              <button
                className={`p-2.5 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'} rounded-xl transition-colors`}
                title="设置"
              >
                <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
