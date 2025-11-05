import { useState } from 'react';
import { BookOpen, Bookmark, Search, TrendingUp, Upload, Sparkles } from 'lucide-react';
import { useBookStore } from './stores/useBookStore';

function App() {
  const { bookshelf, settings } = useBookStore();
  const [showReader, setShowReader] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      console.log('File dropped:', file.name);
      setShowReader(true);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-xl animate-scale-in">
          <div className="glass rounded-5xl p-16 text-center animate-pulse-soft">
            <Upload className="w-24 h-24 mx-auto mb-6 text-white" />
            <h3 className="text-3xl font-bold text-white mb-2">拖放文件到这里</h3>
            <p className="text-white/70 text-lg">支持 EPUB 和 PDF 格式</p>
          </div>
        </div>
      )}

      {/* Welcome Screen */}
      {!showReader && (
        <div className="flex items-center justify-center min-h-screen p-6 animate-slide-up">
          <div className="glass rounded-4xl p-14 max-w-3xl w-full shadow-glass-lg">
            {/* Logo Section */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary via-secondary to-accent-purple rounded-4xl mb-8 animate-float shadow-glass animate-glow">
                <BookOpen className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent-purple bg-clip-text text-transparent mb-4 tracking-tight">
                Moobi Reader
              </h1>
              <p className="text-white/80 text-xl font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-yellow animate-pulse-soft" />
                现代化电子书阅读体验
                <Sparkles className="w-5 h-5 text-accent-yellow animate-pulse-soft" />
              </p>
            </div>

            {/* Upload Section */}
            <div className="mb-12">
              <label
                htmlFor="fileInput"
                className="group flex items-center justify-center gap-4 w-full p-7 bg-gradient-to-r from-primary via-secondary to-accent-purple rounded-3xl cursor-pointer shadow-glass-lg hover:shadow-glass-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-smooth relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
                <Upload className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                <span className="text-white font-bold text-xl tracking-wide relative z-10">
                  选择文件或拖放到这里
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
              <p className="text-center text-white/60 text-sm mt-5 font-medium">
                支持 EPUB 和 PDF 格式 • 最大 500MB
              </p>
            </div>

            {/* Recent Files */}
            {bookshelf.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-5 text-white">最近阅读</h3>
                <div className="space-y-4">
                  {bookshelf.slice(0, 3).map((book, index) => (
                    <div
                      key={book.id}
                      className="group flex items-center gap-5 p-5 bg-white/5 hover:bg-white/10 rounded-3xl cursor-pointer transition-all duration-300 ease-smooth hover:translate-x-2 hover:shadow-soft-lg border border-white/10 hover:border-white/20 animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setShowReader(true)}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft group-hover:shadow-soft-lg group-hover:scale-110 transition-all duration-300">
                        <span className="text-3xl">
                          {book.format === 'epub' ? '📖' : '📄'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate text-white">{book.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-white/70 font-semibold min-w-[3rem]">
                            {book.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: BookOpen, title: '书架管理', desc: '自动保存历史', color: 'from-primary to-primary-light' },
                { icon: Bookmark, title: '书签笔记', desc: '标记重要内容', color: 'from-accent-pink to-accent-orange' },
                { icon: TrendingUp, title: '阅读统计', desc: '追踪进度', color: 'from-accent-green to-accent-teal' },
                { icon: Search, title: '全文搜索', desc: '快速查找', color: 'from-secondary to-accent-purple' },
              ].map((feature, i) => (
                <div
                  key={i}
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
      )}

      {/* Reader Screen */}
      {showReader && (
        <div className="flex items-center justify-center min-h-screen p-6 animate-scale-in">
          <div className="glass rounded-4xl p-14 max-w-5xl w-full shadow-glass-lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mb-8 animate-float shadow-glass">
                <BookOpen className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-bold mb-6 text-white">阅读器界面</h2>
              <p className="text-white/70 text-lg mb-4">
                这里将显示 EPUB 或 PDF 内容
              </p>
              <p className="text-white/50 text-base mb-10 max-w-2xl mx-auto leading-relaxed">
                完整的阅读器组件需要集成 epub.js 和 pdfjs-dist
                <br />
                参考 REACT_ARCHITECTURE.md 文档了解实现细节
              </p>
              <button
                onClick={() => setShowReader(false)}
                className="group px-10 py-4 bg-gradient-to-r from-primary to-secondary rounded-3xl text-white font-bold text-lg hover:shadow-glass-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-smooth relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
                <span className="relative z-10">返回主页</span>
              </button>
            </div>

            {/* Quick Settings Preview */}
            <div className="mt-14 p-8 bg-white/5 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-white">当前设置</h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: '字体大小', value: `${settings.fontSize}px`, color: 'from-primary to-primary-light' },
                  { label: '行间距', value: settings.lineHeight, color: 'from-accent-green to-accent-teal' },
                  { label: '主题', value: settings.theme, color: 'from-secondary to-accent-purple' },
                ].map((setting, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer border border-white/10 hover:border-white/20"
                  >
                    <p className="text-white/60 text-sm mb-3 font-medium">{setting.label}</p>
                    <div className={`inline-block px-4 py-2 bg-gradient-to-r ${setting.color} rounded-xl`}>
                      <p className="font-bold text-lg text-white capitalize">{setting.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
