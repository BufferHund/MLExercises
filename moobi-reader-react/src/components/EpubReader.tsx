import { useEffect, useRef, useState } from 'react';
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
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载EPUB文件
  useEffect(() => {
    let mounted = true;
    let blobUrl: string | null = null;

    const loadEpub = async () => {
      try {
        if (!mounted) return;

        setLoading(true);
        setError(null);

        console.log('Loading EPUB file:', file.name);

        // 将文件转换为ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer loaded, size:', arrayBuffer.byteLength);

        // 创建EPUB book实例（直接使用ArrayBuffer）
        const epubBook = ePub(arrayBuffer);

        console.log('EPUB book instance created');

        // 等待book加载完成
        await epubBook.ready;
        console.log('EPUB book ready');

        if (!mounted || !viewerRef.current) {
          console.log('Component unmounted or ref not ready');
          return;
        }

        // 创建rendition
        const rend = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });

        console.log('Rendition created');

        // 应用主题
        if (theme === 'dark') {
          rend.themes.override('background', '#111827');
          rend.themes.override('color', '#f9fafb');
        } else {
          rend.themes.override('background', '#ffffff');
          rend.themes.override('color', '#111827');
        }

        // 设置字体大小
        rend.themes.fontSize(`${fontSize}px`);

        // 显示第一页
        await rend.display();
        console.log('First page displayed');

        if (!mounted) return;

        setRendition(rend);
        setLoading(false);

        // 监听位置变化
        rend.on('relocated', (location: any) => {
          if (!location || !location.start) return;

          // 计算进度
          try {
            const progress = epubBook.locations.percentageFromCfi(location.start.cfi);
            if (onProgressChange && progress !== undefined && progress !== null) {
              onProgressChange(Math.round(progress * 100));
            }
          } catch (err) {
            console.warn('Error calculating progress:', err);
          }
        });

        // 生成位置信息（用于进度计算）- 在后台异步执行
        epubBook.locations.generate(1600).then(() => {
          console.log('Locations generated');
        }).catch((err: any) => {
          console.warn('Error generating locations:', err);
        });

      } catch (err: any) {
        console.error('Error loading EPUB:', err);
        if (mounted) {
          setError(`加载EPUB文件失败: ${err.message || '未知错误'}`);
          setLoading(false);
        }
      }
    };

    loadEpub();

    return () => {
      mounted = false;
      // 清理
      if (rendition) {
        try {
          rendition.destroy();
        } catch (err) {
          console.warn('Error destroying rendition:', err);
        }
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file]);

  // 更新主题
  useEffect(() => {
    if (rendition) {
      if (theme === 'dark') {
        rendition.themes.override('background', '#111827');
        rendition.themes.override('color', '#f9fafb');
      } else {
        rendition.themes.override('background', '#ffffff');
        rendition.themes.override('color', '#111827');
      }
    }
  }, [theme, rendition]);

  // 更新字体大小
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize, rendition]);

  const goToNextPage = async () => {
    if (rendition) {
      await rendition.next();
    }
  };

  const goToPrevPage = async () => {
    if (rendition) {
      await rendition.prev();
    }
  };

  // 导出方法供父组件调用
  useEffect(() => {
    (window as any).epubReaderControls = {
      nextPage: goToNextPage,
      prevPage: goToPrevPage,
    };
  }, [rendition]);

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
          <p className={`text-base font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`w-full min-h-[600px] rounded-2xl shadow-2xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
      style={{ fontSize: `${fontSize}px` }}
    />
  );
}
