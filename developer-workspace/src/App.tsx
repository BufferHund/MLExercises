import { useState } from 'react';
import { BookOpen, Bookmark, TrendingUp, Upload, Wrench } from 'lucide-react';
import { useBookStore } from './stores/useBookStore';
import WelcomeScreen from './components/WelcomeScreen';
import FileUploader from './components/FileUploader';
import RecentBooks from './components/RecentBooks';
import ImmersiveReader from './components/ImmersiveReader';
import DevToolbox from './components/DevToolbox';
import type { Book } from './types';

type View = 'reader' | 'toolbox';

function App() {
  const { bookshelf } = useBookStore();
  const [currentFile, setCurrentFile] = useState<{ file: File; name: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState<View>('reader');

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

  const handleFileSelect = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    setCurrentFile({ file, name: file.name, type: fileType });
  };

  const handleBookClick = (_book: Book) => {
    // Note: For stored books, we would need to retrieve the actual File object from storage
    // For now, this is a placeholder - real implementation would fetch the file
    alert('书架功能需要完整的文件存储实现。请直接上传文件进行阅读。');
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

  // 如果在工具箱视图
  if (currentView === 'toolbox') {
    return <DevToolbox onBack={() => setCurrentView('reader')} />;
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
              { icon: BookOpen, title: '书架管理', desc: '自动保存历史', color: 'from-primary to-primary-light', onClick: undefined },
              { icon: Bookmark, title: '书签笔记', desc: '标记重要内容', color: 'from-accent-pink to-accent-orange', onClick: undefined },
              { icon: TrendingUp, title: '阅读统计', desc: '追踪进度', color: 'from-accent-green to-accent-teal', onClick: undefined },
              { icon: Wrench, title: '开发工具', desc: '实用工具箱', color: 'from-blue-500 to-purple-500', onClick: () => setCurrentView('toolbox') },
            ].map((feature, i) => (
              <div
                key={i}
                onClick={feature.onClick}
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
