import { useEffect, useState } from 'react';
import mammoth from 'mammoth';

interface DocsReaderProps {
  file: File;
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia' | 'green' | 'blue';
  onProgressChange?: (progress: number) => void;
}

export default function DocsReader({ file, fontSize, theme, onProgressChange }: DocsReaderProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);
        setError(null);

        // 读取文件为 ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // 使用 mammoth 将 .docx 转换为 HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (result.messages.length > 0) {
          console.warn('Mammoth conversion warnings:', result.messages);
        }

        setHtmlContent(result.value);
        setLoading(false);

        // 模拟进度更新
        if (onProgressChange) {
          onProgressChange(100);
        }
      } catch (err) {
        console.error('Error loading DOCX file:', err);
        setError('加载 Word 文档失败。请确保文件格式正确。');
        setLoading(false);
      }
    };

    loadDocx();
  }, [file]); // 只依赖file，避免因onProgressChange引用变化导致重复加载

  // 根据主题获取样式
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-gray-900',
          text: 'text-white',
          secondary: 'text-white/70',
        };
      case 'sepia':
        return {
          bg: 'bg-[#f4ecd8]',
          text: 'text-[#5c4a3c]',
          secondary: 'text-[#5c4a3c]/70',
        };
      case 'green':
        return {
          bg: 'bg-[#cce8cc]',
          text: 'text-[#2d4a2d]',
          secondary: 'text-[#2d4a2d]/70',
        };
      case 'blue':
        return {
          bg: 'bg-[#cce4f7]',
          text: 'text-[#1e3a5f]',
          secondary: 'text-[#1e3a5f]/70',
        };
      default: // light
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          secondary: 'text-gray-700',
        };
    }
  };

  const themeStyles = getThemeStyles();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'
          }`}>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={`text-base font-medium ${themeStyles.secondary}`}>
            正在加载 Word 文档...
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
          <p className={`text-base font-medium ${themeStyles.secondary}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto ${themeStyles.bg}`}>
      <div
        className={`p-8 ${themeStyles.text} docx-content`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 添加样式以确保渲染的内容看起来美观 */}
      <style>{`
        .docx-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .docx-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .docx-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.42em;
        }
        .docx-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.33em;
        }
        .docx-content p {
          margin-bottom: 1em;
        }
        .docx-content ul, .docx-content ol {
          margin-left: 2em;
          margin-bottom: 1em;
        }
        .docx-content li {
          margin-bottom: 0.5em;
        }
        .docx-content table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1em;
        }
        .docx-content table td, .docx-content table th {
          border: 1px solid currentColor;
          padding: 0.5em;
        }
        .docx-content img {
          max-width: 100%;
          height: auto;
        }
        .docx-content strong {
          font-weight: bold;
        }
        .docx-content em {
          font-style: italic;
        }
        .docx-content u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
