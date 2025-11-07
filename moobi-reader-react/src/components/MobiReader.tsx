import { useEffect, useState, useRef } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

interface MobiReaderProps {
  file: File;
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia' | 'green' | 'blue';
  onProgressChange?: (progress: number) => void;
}

export default function MobiReader({ file, fontSize, theme, onProgressChange }: MobiReaderProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // 根据主题获取颜色配置
  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return { background: '#1a1a1a', color: '#e5e5e5' };
      case 'sepia':
        return { background: '#f4ecd8', color: '#5c4a3c' };
      case 'green':
        return { background: '#cce8cc', color: '#2d4a2d' };
      case 'blue':
        return { background: '#cce4f7', color: '#1e3a5f' };
      default:
        return { background: '#ffffff', color: '#1a1a1a' };
    }
  };

  useEffect(() => {
    let effectId = Math.random().toString(36).substr(2, 9);
    let isMounted = true;
    console.log(`🔵 [MOBI Effect #${effectId}] Starting to load MOBI file:`, file.name);

    const loadMobi = async () => {
      // 等待 viewerRef 准备好，最多重试10次
      let retries = 0;
      const maxRetries = 10;
      while (!viewerRef.current && retries < maxRetries && isMounted) {
        console.warn(`⚠️ [MOBI Effect #${effectId}] viewerRef not ready yet, retry ${retries + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 100)); // 等待100ms
        retries++;
      }

      if (!isMounted) {
        console.warn(`⚠️ [MOBI Effect #${effectId}] Component unmounted during retry`);
        return;
      }

      if (!viewerRef.current) {
        console.error(`❌ [MOBI Effect #${effectId}] viewerRef still not ready after ${maxRetries} retries`);
        setError('初始化失败：无法准备阅读器容器。请刷新页面重试。');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`📖 [MOBI Effect #${effectId}] Reading file as ArrayBuffer...`);
        const arrayBuffer = await file.arrayBuffer();

        console.log(`📚 [MOBI Effect #${effectId}] Creating EPUB.js book instance...`);
        // 尝试使用 EPUB.js 打开 MOBI 文件
        // 注意：这主要适用于 KF8 格式的 MOBI 文件（基于 EPUB 的新格式）
        // 旧的 MOBI 格式可能无法正常工作
        const newBook = ePub(arrayBuffer);

        if (!isMounted || !viewerRef.current) {
          console.warn(`⚠️ [MOBI Effect #${effectId}] Component unmounted before rendering`);
          newBook.destroy();
          return;
        }

        console.log(`🎨 [MOBI Effect #${effectId}] Creating rendition...`);
        const newRendition = newBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          snap: true,
        });

        const themeColors = getThemeColors();

        // 设置主题
        newRendition.themes.default(themeColors);

        // 设置字体大小
        newRendition.themes.fontSize(`${fontSize}px`);

        console.log(`🚀 [MOBI Effect #${effectId}] Displaying book...`);
        await newRendition.display();

        if (!isMounted) {
          console.warn(`⚠️ [MOBI Effect #${effectId}] Component unmounted after display`);
          newRendition.destroy();
          newBook.destroy();
          return;
        }

        // 修复iframe sandbox问题
        newRendition.hooks.content.register((contents: any) => {
          const iframe = contents.document?.defaultView?.frameElement;
          if (iframe) {
            const currentSandbox = iframe.getAttribute('sandbox') || '';
            if (!currentSandbox.includes('allow-scripts')) {
              iframe.setAttribute('sandbox', currentSandbox + ' allow-scripts');
              console.log(`✅ [MOBI Effect #${effectId}] Fixed iframe sandbox to allow scripts`);
            }
          }

          // 防止图片拉伸
          const doc = contents.document;
          if (doc) {
            const style = doc.createElement('style');
            style.textContent = `
              img {
                max-width: 100% !important;
                height: auto !important;
                object-fit: contain !important;
              }
            `;
            doc.head.appendChild(style);
          }
        });

        setBook(newBook);
        setRendition(newRendition);
        setLoading(false);
        console.log(`✅ [MOBI Effect #${effectId}] MOBI file loaded successfully`);

        if (onProgressChange) {
          onProgressChange(0);
        }
      } catch (err) {
        console.error(`❌ [MOBI Effect #${effectId}] Error loading MOBI file:`, err);
        if (isMounted) {
          setError('无法加载此 MOBI 文件。请注意：只有较新的 KF8 格式 MOBI 文件受支持。旧版 MOBI 格式可能无法正常显示。');
          setLoading(false);
        }
      }
    };

    loadMobi();

    return () => {
      isMounted = false;
      console.log(`🧹 [MOBI Effect #${effectId}] Cleanup: destroying book and rendition...`);
      if (rendition) {
        rendition.destroy();
      }
      if (book) {
        book.destroy();
      }
    };
  }, [file]);

  // 更新字体大小
  useEffect(() => {
    if (rendition) {
      console.log(`🔤 Setting font size to ${fontSize}px`);
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize, rendition]);

  // 更新主题
  useEffect(() => {
    if (rendition) {
      const themeColors = getThemeColors();
      console.log(`🎨 Applying theme:`, theme, themeColors);
      rendition.themes.default(themeColors);
    }
  }, [theme, rendition]);

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
      default:
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
            正在加载 MOBI 文件...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md px-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-500/10'
          }`}>
            <span className="text-3xl">⚠️</span>
          </div>
          <p className={`text-base font-medium ${themeStyles.secondary} mb-4`}>
            {error}
          </p>
          <p className={`text-sm ${themeStyles.secondary}`}>
            建议：尝试将 MOBI 文件转换为 EPUB 格式以获得更好的兼容性。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`w-full h-full ${themeStyles.bg}`}
      style={{ minHeight: '600px' }}
    />
  );
}
