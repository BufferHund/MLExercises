import { useState } from 'react';
import { BookOpen, Bookmark, Search, Settings, TrendingUp } from 'lucide-react';
import { useBookStore } from './stores/useBookStore';

function App() {
  const { bookshelf, settings } = useBookStore();
  const [showReader, setShowReader] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Welcome Screen */}
      {!showReader && (
        <div className="flex items-center justify-center min-h-screen p-6 animate-slide-up">
          <div className="glass rounded-3xl p-12 max-w-2xl w-full">
            {/* Logo Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl mb-6 animate-float">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                Moobi Reader
              </h1>
              <p className="text-white/70 text-lg">
                现代化电子书阅读体验
              </p>
            </div>

            {/* Upload Section */}
            <div className="mb-10">
              <label
                htmlFor="fileInput"
                className="flex items-center justify-center gap-3 w-full p-6 bg-gradient-to-r from-primary to-secondary rounded-2xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-white font-semibold text-lg">
                  选择文件
                </span>
              </label>
              <input
                id="fileInput"
                type="file"
                accept=".epub,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('File selected:', file.name);
                    setShowReader(true);
                  }
                }}
              />
              <p className="text-center text-white/60 text-sm mt-4">
                支持 EPUB 和 PDF 格式
              </p>
            </div>

            {/* Recent Files */}
            {bookshelf.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">最近阅读</h3>
                <div className="space-y-3">
                  {bookshelf.slice(0, 3).map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-300 hover:translate-x-2"
                      onClick={() => setShowReader(true)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {book.format === 'epub' ? '📖' : '📄'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{book.title}</p>
                        <p className="text-sm text-white/60">
                          进度: {book.progress}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, title: '书架管理', desc: '自动保存历史' },
                { icon: Bookmark, title: '书签笔记', desc: '标记重要内容' },
                { icon: TrendingUp, title: '阅读统计', desc: '追踪进度' },
                { icon: Search, title: '全文搜索', desc: '快速查找' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <feature.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-white/60">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reader Screen */}
      {showReader && (
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="glass rounded-3xl p-12 max-w-4xl w-full">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">阅读器界面</h2>
              <p className="text-white/70 mb-8">
                这里将显示 EPUB 或 PDF 内容
              </p>
              <p className="text-white/50 text-sm mb-8">
                完整的阅读器组件需要集成 epub.js 和 pdfjs-dist
                <br />
                参考 REACT_ARCHITECTURE.md 文档了解实现细节
              </p>
              <button
                onClick={() => setShowReader(false)}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                返回主页
              </button>
            </div>

            {/* Quick Settings Preview */}
            <div className="mt-12 p-6 bg-white/5 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">当前设置</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-white/60">字体大小</p>
                  <p className="font-semibold">{settings.fontSize}px</p>
                </div>
                <div>
                  <p className="text-white/60">行间距</p>
                  <p className="font-semibold">{settings.lineHeight}</p>
                </div>
                <div>
                  <p className="text-white/60">主题</p>
                  <p className="font-semibold capitalize">{settings.theme}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
