import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// 配置 PDF.js worker
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfReaderProps {
  file: File;
  theme: 'light' | 'dark';
  onPageChange?: (current: number, total: number) => void;
  onProgressChange?: (progress: number) => void;
}

// 模块级缓存：防止React Strict Mode重复加载
const fileCache = new Map<string, { promise: Promise<ArrayBuffer>, result?: ArrayBuffer }>();

function getCacheKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

async function loadFileWithCache(file: File, effectId: number): Promise<ArrayBuffer> {
  const key = getCacheKey(file);

  if (fileCache.has(key)) {
    const cached = fileCache.get(key)!;
    if (cached.result) {
      console.log(`🚀 [PDF Effect #${effectId}] Using cached ArrayBuffer (instant)`);
      return cached.result;
    } else {
      console.log(`⏳ [PDF Effect #${effectId}] Waiting for in-flight ArrayBuffer load...`);
      const result = await cached.promise;
      console.log(`✅ [PDF Effect #${effectId}] Got result from in-flight load`);
      return result;
    }
  }

  console.log(`📄 [PDF Effect #${effectId}] Starting NEW file.arrayBuffer()...`);
  const promise = file.arrayBuffer();
  fileCache.set(key, { promise });

  const result = await promise;
  fileCache.set(key, { promise, result });

  // 5秒后清除缓存
  setTimeout(() => {
    console.log(`🧹 [PDF Cache] Clearing cache for ${file.name}`);
    fileCache.delete(key);
  }, 5000);

  return result;
}

export default function PdfReader({ file, theme, onPageChange, onProgressChange }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const effectIdRef = useRef(0); // Track effect invocations
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // 加载PDF文件 - 只依赖file
  useEffect(() => {
    const effectId = ++effectIdRef.current;
    const startTime = Date.now();
    let mounted = true;

    console.log(`🔵 [PDF Effect #${effectId}] ========== EFFECT START ==========`);
    console.log(`🔵 [PDF Effect #${effectId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`🔵 [PDF Effect #${effectId}] File: ${file.name}`);
    console.log(`🔵 [PDF Effect #${effectId}] File size: ${file.size} bytes (${(file.size/1024/1024).toFixed(2)} MB)`);

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);

        const arrayBuffer = await loadFileWithCache(file, effectId);
        const arrayBufferTime = Date.now() - startTime;
        console.log(`✅ [PDF Effect #${effectId}] ArrayBuffer ready in ${arrayBufferTime}ms`);

        if (!mounted) {
          console.log(`⚠️ [PDF Effect #${effectId}] Component unmounted after arrayBuffer, ABORTING`);
          return;
        }

        console.log(`📄 [PDF Effect #${effectId}] Starting pdfjsLib.getDocument()...`);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        const docLoadTime = Date.now() - startTime;
        console.log(`✅ [PDF Effect #${effectId}] PDF document loaded in ${docLoadTime}ms`);
        console.log(`✅ [PDF Effect #${effectId}] Total pages: ${pdfDoc.numPages}`);

        if (!mounted) {
          console.log(`⚠️ [PDF Effect #${effectId}] Component unmounted after loading, CLEANING UP`);
          pdfDoc.cleanup?.();
          return;
        }

        console.log(`✅ [PDF Effect #${effectId}] Setting state: pdfDoc, totalPages=${pdfDoc.numPages}, loading=false`);
        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setLoading(false);

        if (onPageChange) {
          onPageChange(1, pdfDoc.numPages);
        }

        console.log(`✅ [PDF Effect #${effectId}] PDF ready for rendering`);
      } catch (err: any) {
        const errorTime = Date.now() - startTime;
        console.error(`❌ [PDF Effect #${effectId}] Error after ${errorTime}ms:`, err);
        if (mounted) {
          setError(`加载PDF文件失败: ${err.message || '未知错误'}`);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      mounted = false;
      const cleanupTime = Date.now() - startTime;
      console.log(`🧹 [PDF Effect #${effectId}] ========== CLEANUP CALLED ==========`);
      console.log(`🧹 [PDF Effect #${effectId}] Cleanup after ${cleanupTime}ms`);

      if (pdfDocRef.current) {
        console.log(`🧹 [PDF Effect #${effectId}] Cleaning up PDF document`);
        pdfDocRef.current.cleanup?.();
        pdfDocRef.current = null;
      }
      console.log(`🧹 [PDF Effect #${effectId}] Cleanup complete`);
    };
  }, [file]);

  // 渲染当前页 - 只依赖currentPage和loading
  useEffect(() => {
    if (!pdfDocRef.current || loading || !canvasRef.current || !containerRef.current) {
      console.log(`⏸️ [PDF Render] Skipping render: pdfDoc=${!!pdfDocRef.current}, loading=${loading}, canvas=${!!canvasRef.current}, container=${!!containerRef.current}`);
      return;
    }

    if (rendering) {
      console.log('⏳ [PDF Render] Already rendering, skipping...');
      return;
    }

    let mounted = true;

    const renderPage = async () => {
      try {
        setRendering(true);

        // 取消之前的渲染任务
        if (renderTaskRef.current) {
          console.log('🚫 [PDF Render] Cancelling previous render task');
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const context = canvas.getContext('2d');
        if (!context) {
          setError('无法初始化Canvas渲染上下文');
          setRendering(false);
          return;
        }

        console.log(`📖 [PDF Render] Rendering page ${currentPage}/${totalPages}`);

        const page = await pdfDocRef.current.getPage(currentPage);

        // 计算合适的缩放比例
        const containerWidth = container.clientWidth - 32;
        const viewport = page.getViewport({ scale: 1.0 });

        const targetScale = (containerWidth * 0.9) / viewport.width;
        const scale = Math.min(Math.max(targetScale, 1.0), 2.5);

        const scaledViewport = page.getViewport({ scale });

        console.log(`📐 [PDF Render] Viewport: container=${containerWidth}px, page=${viewport.width}x${viewport.height}, scale=${scale.toFixed(2)}, final=${scaledViewport.width}x${scaledViewport.height}`);

        // 设置canvas尺寸
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        // 清空canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 渲染PDF页面
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          transform,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;

        await task.promise;

        if (!mounted) return;

        console.log('✅ [PDF Render] Page rendered successfully');
        renderTaskRef.current = null;

        const progress = Math.round((currentPage / totalPages) * 100);
        if (onProgressChange) {
          onProgressChange(progress);
        }

        if (onPageChange) {
          onPageChange(currentPage, totalPages);
        }

        setRendering(false);
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
          console.log('⚠️ [PDF Render] Rendering was cancelled');
        } else {
          console.error('❌ [PDF Render] Error rendering page:', err);
          if (mounted) {
            setError(`渲染PDF页面失败: ${err.message || '未知错误'}`);
          }
        }
        setRendering(false);
      }
    };

    renderPage();

    return () => {
      mounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [currentPage, loading]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages && !rendering) {
      console.log(`➡️ [PDF Nav] Next page requested: ${currentPage} -> ${currentPage + 1}`);
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages, rendering]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1 && !rendering) {
      console.log(`⬅️ [PDF Nav] Previous page requested: ${currentPage} -> ${currentPage - 1}`);
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, rendering]);

  // 导出方法供父组件调用
  useEffect(() => {
    (window as any).pdfReaderControls = {
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
            正在加载PDF文档...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            theme === 'dark' ? 'bg-red-500/10' : 'bg-red-500/10'
          }`}>
            <span className="text-3xl">❌</span>
          </div>
          <p className={`text-base font-medium mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center w-full px-4">
      <canvas
        ref={canvasRef}
        className={`max-w-full h-auto rounded-2xl shadow-2xl mb-6 ${
          theme === 'dark' ? 'bg-white' : 'bg-white'
        }`}
      />
      <div className={`flex items-center gap-4 text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
        <span>第 {currentPage} 页</span>
        <span>/</span>
        <span>共 {totalPages} 页</span>
        {rendering && (
          <span className="text-primary">⏳ 渲染中...</span>
        )}
      </div>
    </div>
  );
}
