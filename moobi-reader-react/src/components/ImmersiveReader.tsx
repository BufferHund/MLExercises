import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, Moon, Sun, Bookmark, Menu } from 'lucide-react';

interface ImmersiveReaderProps {
  fileName: string;
  fileType: string;
  onClose: () => void;
}

export default function ImmersiveReader({ fileName, fileType, onClose }: ImmersiveReaderProps) {
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
    setProgress(Math.min(100, progress + 5));
  };

  const handlePrevPage = () => {
    setProgress(Math.max(0, progress - 5));
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
      onMouseMove={handleMouseMove}
    >
      {/* 顶部控制栏 */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="glass border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            {/* 左侧 */}
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div>
                <h3 className="text-white font-semibold text-sm truncate max-w-[200px]">
                  {fileName}
                </h3>
                <p className="text-white/60 text-xs">
                  {fileType.toUpperCase()} 格式
                </p>
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-900" />
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
              >
                {isFullscreen ? '退出全屏' : '全屏阅读'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主阅读区域 */}
      <div className="h-full flex items-center justify-center p-8 pt-24 pb-20">
        <div className={`max-w-4xl w-full h-full overflow-y-auto ${
          theme === 'dark' ? 'text-white/90' : 'text-gray-900'
        }`}>
          <div
            className="prose prose-lg max-w-none"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {/* 这里将显示实际的文档内容 */}
            <div className="text-center py-20">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${
                theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'
              }`}>
                <Menu className={`w-10 h-10 ${theme === 'dark' ? 'text-white/50' : 'text-gray-900/50'}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                沉浸式阅读模式
              </h3>
              <p className={`text-base mb-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                {fileName}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                完整实现需要根据文件格式集成相应的渲染库：
              </p>
              <ul className={`text-sm mt-4 space-y-2 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                <li>📖 EPUB: epub.js</li>
                <li>📄 PDF: pdfjs-dist</li>
                <li>📝 TXT/MD: 纯文本渲染</li>
                <li>📚 MOBI/AZW3: mobi.js 或转换为 EPUB</li>
                <li>📃 DOCX: mammoth.js</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 底部控制栏 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="glass border-t border-white/10">
          {/* 进度条 */}
          <div className="px-4 pt-3">
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                {progress}%
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                100%
              </span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <button
                onClick={handleNextPage}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <Bookmark className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  A-
                </button>
                <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  {fontSize}
                </span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  A+
                </button>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
