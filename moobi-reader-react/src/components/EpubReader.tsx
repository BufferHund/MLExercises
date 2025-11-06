import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
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
  const effectIdRef = useRef(0); // Track effect invocations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerMounted, setViewerMounted] = useState(false);

  // 第一步：使用useLayoutEffect检测viewer div已经mounted
  useLayoutEffect(() => {
    const layoutId = ++effectIdRef.current;
    console.log(`🟢 [EPUB Layout #${layoutId}] ========== LAYOUT EFFECT ==========`);
    console.log(`🟢 [EPUB Layout #${layoutId}] viewerRef.current:`, viewerRef.current);

    if (viewerRef.current) {
      console.log(`✅ [EPUB Layout #${layoutId}] Viewer div is mounted in DOM`);
      setViewerMounted(true);
    } else {
      console.log(`⚠️ [EPUB Layout #${layoutId}] Viewer div NOT in DOM yet`);
    }

    return () => {
      console.log(`🧹 [EPUB Layout #${layoutId}] Layout cleanup`);
    };
  }, []);

  // 第二步：加载EPUB文件 - 只在viewer mounted后执行
  useEffect(() => {
    if (!viewerMounted) {
      console.log('⏸️ [EPUB Load] Waiting for viewer to mount...');
      return;
    }

    const effectId = effectIdRef.current + 1000; // Different ID range for load effects
    const startTime = Date.now();
    let mounted = true;

    console.log(`🔵 [EPUB Effect #${effectId}] ========== LOAD EFFECT START ==========`);
    console.log(`🔵 [EPUB Effect #${effectId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`🔵 [EPUB Effect #${effectId}] File: ${file.name}`);
    console.log(`🔵 [EPUB Effect #${effectId}] File size: ${file.size} bytes (${(file.size/1024/1024).toFixed(2)} MB)`);
    console.log(`🔵 [EPUB Effect #${effectId}] viewerRef.current:`, viewerRef.current);

    const loadEpub = async () => {
      try {
        console.log(`📚 [EPUB Effect #${effectId}] Starting file.arrayBuffer()...`);
        setLoading(true);
        setError(null);

        const arrayBuffer = await file.arrayBuffer();
        const arrayBufferTime = Date.now() - startTime;
        console.log(`✅ [EPUB Effect #${effectId}] ArrayBuffer loaded in ${arrayBufferTime}ms`);

        if (!mounted) {
          console.log(`⚠️ [EPUB Effect #${effectId}] Component unmounted after arrayBuffer, ABORTING`);
          return;
        }

        console.log(`📚 [EPUB Effect #${effectId}] Creating EPUB book instance...`);
        const epubBook = ePub(arrayBuffer);
        bookRef.current = epubBook;

        console.log(`📚 [EPUB Effect #${effectId}] Waiting for book.ready...`);
        await epubBook.ready;
        const bookReadyTime = Date.now() - startTime;
        console.log(`✅ [EPUB Effect #${effectId}] EPUB book ready in ${bookReadyTime}ms`);

        if (!mounted) {
          console.log(`⚠️ [EPUB Effect #${effectId}] Component unmounted after book ready, ABORTING`);
          return;
        }

        if (!viewerRef.current) {
          throw new Error(`Viewer element is null even though viewerMounted=${viewerMounted}`);
        }

        console.log(`📚 [EPUB Effect #${effectId}] Creating rendition with viewer element...`);
        const rend = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '600px',
          spread: 'none',
          allowScriptedContent: true, // 允许EPUB中的脚本内容
        });

        renditionRef.current = rend;
        console.log(`✅ [EPUB Effect #${effectId}] Rendition created`);

        // 修复iframe sandbox问题：允许脚本执行
        rend.hooks.content.register((contents: any) => {
          const iframe = contents.document?.defaultView?.frameElement;
          if (iframe) {
            const currentSandbox = iframe.getAttribute('sandbox') || '';
            if (!currentSandbox.includes('allow-scripts')) {
              iframe.setAttribute('sandbox', currentSandbox + ' allow-scripts');
              console.log(`✅ [EPUB Effect #${effectId}] Fixed iframe sandbox to allow scripts`);
            }
          }
        });

        // 应用初始主题
        console.log(`🎨 [EPUB Effect #${effectId}] Applying theme: ${theme}`);
        if (theme === 'dark') {
          rend.themes.override('background', '#111827');
          rend.themes.override('color', '#f9fafb');
        } else {
          rend.themes.override('background', '#ffffff');
          rend.themes.override('color', '#111827');
        }

        // 设置初始字体大小
        console.log(`📝 [EPUB Effect #${effectId}] Setting font size: ${fontSize}px`);
        rend.themes.fontSize(`${fontSize}px`);

        // 显示第一页
        console.log(`📚 [EPUB Effect #${effectId}] Displaying first page...`);
        await rend.display();
        const displayTime = Date.now() - startTime;
        console.log(`✅ [EPUB Effect #${effectId}] First page displayed in ${displayTime}ms`);

        if (!mounted) {
          console.log(`⚠️ [EPUB Effect #${effectId}] Component unmounted after display, ABORTING`);
          return;
        }

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
            console.warn(`⚠️ [EPUB Effect #${effectId}] Error calculating progress:`, err);
          }
        });

        // 生成位置信息（在后台异步执行）
        epubBook.locations.generate(1600).then(() => {
          console.log(`✅ [EPUB Effect #${effectId}] Locations generated`);
        }).catch((err: any) => {
          console.warn(`⚠️ [EPUB Effect #${effectId}] Error generating locations:`, err);
        });

        console.log(`✅ [EPUB Effect #${effectId}] EPUB ready for reading`);

      } catch (err: any) {
        const errorTime = Date.now() - startTime;
        console.error(`❌ [EPUB Effect #${effectId}] Error after ${errorTime}ms:`, err);
        if (mounted) {
          setError(`加载EPUB文件失败: ${err.message || '未知错误'}`);
          setLoading(false);
        }
      }
    };

    loadEpub();

    return () => {
      mounted = false;
      const cleanupTime = Date.now() - startTime;
      console.log(`🧹 [EPUB Effect #${effectId}] ========== CLEANUP CALLED ==========`);
      console.log(`🧹 [EPUB Effect #${effectId}] Cleanup after ${cleanupTime}ms`);

      if (renditionRef.current) {
        console.log(`🧹 [EPUB Effect #${effectId}] Destroying rendition`);
        try {
          renditionRef.current.destroy();
        } catch (err) {
          console.warn(`⚠️ [EPUB Effect #${effectId}] Error destroying rendition:`, err);
        }
        renditionRef.current = null;
      }
      console.log(`🧹 [EPUB Effect #${effectId}] Cleanup complete`);
    };
  }, [file, viewerMounted]);

  // 更新主题
  useEffect(() => {
    if (renditionRef.current) {
      console.log(`🎨 [EPUB Theme] Updating theme to: ${theme}`);
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
      console.log(`📝 [EPUB Font] Updating font size to: ${fontSize}px`);
      renditionRef.current.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize]);

  const navigatingRef = useRef(false); // 防止重复翻页

  const goToNextPage = useCallback(async () => {
    if (renditionRef.current && !navigatingRef.current) {
      navigatingRef.current = true;
      console.log('➡️ [EPUB Nav] Next page requested');
      try {
        await renditionRef.current.next();
      } catch (err) {
        console.error('❌ [EPUB Nav] Error navigating next:', err);
      } finally {
        // 300ms后允许下一次翻页
        setTimeout(() => {
          navigatingRef.current = false;
        }, 300);
      }
    } else if (navigatingRef.current) {
      console.log('⏸️ [EPUB Nav] Navigation in progress, skipping...');
    }
  }, []);

  const goToPrevPage = useCallback(async () => {
    if (renditionRef.current && !navigatingRef.current) {
      navigatingRef.current = true;
      console.log('⬅️ [EPUB Nav] Previous page requested');
      try {
        await renditionRef.current.prev();
      } catch (err) {
        console.error('❌ [EPUB Nav] Error navigating prev:', err);
      } finally {
        // 300ms后允许下一次翻页
        setTimeout(() => {
          navigatingRef.current = false;
        }, 300);
      }
    } else if (navigatingRef.current) {
      console.log('⏸️ [EPUB Nav] Navigation in progress, skipping...');
    }
  }, []);

  // 导出方法供父组件调用
  useEffect(() => {
    (window as any).epubReaderControls = {
      nextPage: goToNextPage,
      prevPage: goToPrevPage,
    };
  }, [goToNextPage, goToPrevPage]);

  return (
    <div className="relative w-full min-h-[600px]">
      {/* Viewer div - always rendered */}
      <div
        ref={viewerRef}
        className={`w-full min-h-[600px] rounded-2xl shadow-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              theme === 'dark' ? 'bg-white/10' : 'bg-gray-900/10'
            }`}>
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className={`text-base font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-200'}`}>
              正在加载EPUB文档...
            </p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="text-center max-w-md">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              theme === 'dark' ? 'bg-red-500/10' : 'bg-red-500/10'
            }`}>
              <span className="text-3xl">❌</span>
            </div>
            <p className={`text-base font-medium mb-2 text-white`}>
              {error}
            </p>
            <p className={`text-sm text-white/70`}>
              请确保文件是有效的EPUB格式
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
