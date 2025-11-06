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

export default function PdfReader({ file, theme, onPageChange, onProgressChange }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const loadingRef = useRef(false); // 防止React Strict Mode双重加载
  const fileNameRef = useRef<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // 加载PDF文件 - 只依赖file
  useEffect(() => {
    // 防止Strict Mode导致的双重加载
    if (loadingRef.current && fileNameRef.current === file.name) {
      console.log('⏭️ Skipping duplicate PDF load (Strict Mode)');
      return;
    }

    loadingRef.current = true;
    fileNameRef.current = file.name;
    let mounted = true;

    const loadPdf = async () => {
      try {
        console.log('📄 Loading PDF file:', file.name);
        setLoading(true);
        setError(null);
        setCurrentPage(1); // 重置页码

        const arrayBuffer = await file.arrayBuffer();
        console.log('✅ PDF ArrayBuffer loaded, size:', arrayBuffer.byteLength);

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        console.log('✅ PDF document loaded, pages:', pdfDoc.numPages);

        if (!mounted) return;

        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setLoading(false);

        if (onPageChange) {
          onPageChange(1, pdfDoc.numPages);
        }

        console.log('✅ PDF ready for rendering');
      } catch (err: any) {
        console.error('❌ Error loading PDF:', err);
        if (mounted) {
          setError(`加载PDF文件失败: ${err.message || '未知错误'}`);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      mounted = false;
      console.log('🧹 PDF loader cleanup');
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup?.();
      }
      // 只有在文件真正改变时才重置loading标志
      if (fileNameRef.current !== file.name) {
        loadingRef.current = false;
      }
    };
  }, [file]); // 只依赖file

  // 渲染当前页 - 只依赖currentPage和loading
  useEffect(() => {
    if (!pdfDocRef.current || loading || !canvasRef.current || !containerRef.current) {
      return;
    }

    if (rendering) {
      console.log('⏳ Already rendering, skipping...');
      return;
    }

    let mounted = true;

    const renderPage = async () => {
      try {
        setRendering(true);

        // 取消之前的渲染任务
        if (renderTaskRef.current) {
          console.log('🚫 Cancelling previous render task');
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

        console.log(`📖 Rendering PDF page ${currentPage}/${totalPages}`);

        const page = await pdfDocRef.current.getPage(currentPage);

        // 计算合适的缩放比例 - 改进算法
        const containerWidth = container.clientWidth - 32; // 减去padding
        const viewport = page.getViewport({ scale: 1.0 });

        // 目标：页面宽度占容器的90%
        const targetScale = (containerWidth * 0.9) / viewport.width;
        // 限制在合理范围：最小1.0，最大2.5
        const scale = Math.min(Math.max(targetScale, 1.0), 2.5);

        const scaledViewport = page.getViewport({ scale });

        console.log('📐 Viewport calculated:', {
          containerWidth,
          pageWidth: viewport.width,
          pageHeight: viewport.height,
          targetScale,
          finalScale: scale,
          scaledWidth: scaledViewport.width,
          scaledHeight: scaledViewport.height
        });

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

        console.log('✅ Page rendered successfully');
        renderTaskRef.current = null;

        // 更新进度
        const progress = Math.round((currentPage / totalPages) * 100);
        if (onProgressChange) {
          onProgressChange(progress);
        }

        // 通知页面变化
        if (onPageChange) {
          onPageChange(currentPage, totalPages);
        }

        setRendering(false);
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
          console.log('⚠️ Rendering was cancelled');
        } else {
          console.error('❌ Error rendering page:', err);
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
  }, [currentPage, loading]); // 只依赖currentPage和loading

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages && !rendering) {
      console.log('➡️ Next page requested');
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages, rendering]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1 && !rendering) {
      console.log('⬅️ Previous page requested');
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
