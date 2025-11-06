import { useEffect, useState } from 'react';

interface TextReaderProps {
  file: File;
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia' | 'green' | 'blue';
  onProgressChange?: (progress: number) => void;
}

export default function TextReader({ file, fontSize, theme, onProgressChange }: TextReaderProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadText = async () => {
      try {
        setLoading(true);
        setError(null);

        const text = await file.text();
        setContent(text);
        setLoading(false);

        // 模拟进度更新
        if (onProgressChange) {
          onProgressChange(100);
        }
      } catch (err) {
        console.error('Error loading text file:', err);
        setError('加载文本文件失败');
        setLoading(false);
      }
    };

    loadText();
  }, [file, onProgressChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'
          }`}>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={`text-base font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
            正在加载文本文档...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            theme === 'dark' ? 'bg-red-500/10' : 'bg-red-500/10'
          }`}>
            <span className="text-3xl">❌</span>
          </div>
          <p className={`text-base font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`p-8 rounded-2xl shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
      >
        <pre
          className="whitespace-pre-wrap font-sans"
          style={{ fontFamily: 'inherit' }}
        >
          {content}
        </pre>
      </div>
    </div>
  );
}
