import { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import type { Rendition } from 'epubjs';

interface EpubReaderProps {
  file: File;
  fontSize: number;
  theme: 'light' | 'dark';
  onProgressChange?: (progress: number) => void;
}

export default function EpubReader({ file, fontSize, theme, onProgressChange }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载EPUB文件 - 只依赖file
  useEffect(() => {
    let mounted = true;

    const loadEpub = async () => {
      try {
        console.log('📚 Loading EPUB file:', file.name);
        setLoading(true);
        setError(null);

        // 将文件转换为ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        console.log('✅ EPUB ArrayBuffer loaded, size:', arrayBuffer.byteLength);

        // 创建EPUB book实例（直接使用ArrayBuffer）
        const epubBook = ePub(arrayBuffer);
        bookRef.current = epubBook;

        console.log('✅ EPUB book instance created');

        // 等待book加载完成
        await epubBook.ready;
        console.log('✅ EPUB book ready');

        if (!mounted) return;

        // 等待viewer准备好
        let attempts = 0;
        while (!viewerRef.current && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }

        if (!viewerRef.current) {
          throw new Error('Viewer element not ready after 2.5 seconds');
        }

        if (!mounted) return;

        // 创建rendition
        const rend = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '600px',
          spread: 'none',
        });

        renditionRef.current = rend;
        console.log('✅ Rendition created');

        // 应用初始主题
        if (theme === 'dark') {
          rend.themes.override('background', '#111827');
          rend.themes.override('color', '#f9fafb');
        } else {
          rend.themes.override('background', '#ffffff');
          rend.themes.override('color', '#111827');
        }

        // 设置初始字体大小
        rend.themes.fontSize(`${fontSize}px`);

        // 显示第一页
        await rend.display();
        console.log('✅ First page displayed');

        if (!mounted) return;

        setLoading(false);

        // 监听位置变化
        rend.on('relocated', (location: any) => {
          if (!location || !location.start) return;

          try {
            const progress = epubBook.locations.percentageFromCfi(location.start.cfi);
            if (onProgressChange && progress !== undefined && progress !== null) {
              onProgressChange(Math.round(progress * 100));
            }
          } catch (err) {
            console.warn('⚠️ Error calculating progress:', err);
          }
        });

        // 生成位置信息（在后台异步执行）
        epubBook.locations.generate(1600).then(() => {
          console.log('✅ Locations generated');
        }).catch((err: any) => {
          console.warn('⚠️ Error generating locations:', err);
        });

        console.log('✅ EPUB ready for reading');

      } catch (err: any) {
        console.error('❌ Error loading EPUB:', err);
        if (mounted) {
          setError(`加载EPUB文件失败: ${err.message || '未知错误'}`);
          setLoading(false);
        }
      }
    };

    loadEpub();

    return () => {
      mounted = false;
      console.log('🧹 EPUB loader cleanup');
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch (err) {
          console.warn('⚠️ Error destroying rendition:', err);
        }
      }
    };
  }, [file]); // 只依赖file

  // 更新主题
  useEffect(() => {
    if (renditionRef.current) {
      if (theme === 'dark') {
        renditionRef.current.themes.override('background', '#111827');
        renditionRef.current.themes.override('color', '#f9fafb');
      } else {
        renditionRef.current.themes.override('background', '#ffffff');
        renditionRef.current.themes.override('color', '#111827');
      }
    }
  }, [theme]);

  // 更新字体大小
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize]);

  const goToNextPage = useCallback(async () => {
    if (renditionRef.current) {
      console.log('➡️ EPUB next page requested');
      await renditionRef.current.next();
    }
  }, []);

  const goToPrevPage = useCallback(async () => {
    if (renditionRef.current) {
      console.log('⬅️ EPUB previous page requested');
      await renditionRef.current.prev();
    }
  }, []);

  // 导出方法供父组件调用
  useEffect(() => {
    (window as any).epubReaderControls = {
      nextPage: goToNextPage,
      prevPage: goToPrevPage,
    };
  }, [goToNextPage, goToPrevPage]);

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
            正在加载EPUB文档...
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
          <p className={`text-base font-medium mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
            {error}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
            请确保文件是有效的EPUB格式
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`w-full min-h-[600px] rounded-2xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
    />
  );
}
