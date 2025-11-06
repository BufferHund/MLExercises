import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// 配置 PDF.js worker - 使用本地打包的worker
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Callback ref to ensure canvas is ready
  const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node) {
      console.log('Canvas element mounted');
      canvasRef.current = node;
      setCanvasReady(true);
    }
  }, []);

  // 加载PDF文件
  useEffect(() => {
    let mounted = true;

    const loadPdf = async () => {
      try {
        console.log('Loading PDF file:', file.name);
        setLoading(true);
        setError(null);

        const arrayBuffer = await file.arrayBuffer();
        console.log('PDF ArrayBuffer loaded, size:', arrayBuffer.byteLength);

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        console.log('PDF document loaded, pages:', pdfDoc.numPages);

        if (!mounted) {
          console.log('Component unmounted, aborting PDF load');
          return;
        }

        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        setLoading(false);

        if (onPageChange) {
          onPageChange(1, pdfDoc.numPages);
        }

        console.log('PDF ready for rendering');
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (mounted) {
          setError(`加载PDF文件失败: ${err.message || '未知错误'}`);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      mounted = false;
      console.log('PDF loader cleanup');
    };
  }, [file, onPageChange]);

  // 渲染当前页
  useEffect(() => {
    if (!pdfDocRef.current || !canvasReady || !canvasRef.current || loading) {
      console.log('Skipping render - not ready', {
        pdf: !!pdfDocRef.current,
        canvasReady,
        canvas: !!canvasRef.current,
        loading
      });
      return;
    }

    let mounted = true;

    const renderPage = async () => {
      try {
        // 取消之前的渲染任务
        if (renderTaskRef.current) {
          console.log('Cancelling previous render task');
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
          console.warn('Canvas ref became null during render');
          return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
          console.error('Failed to get 2D context');
          setError('无法初始化Canvas渲染上下文');
          return;
        }

        console.log(`Rendering PDF page ${currentPage}/${totalPages}`);

        const page = await pdfDocRef.current.getPage(currentPage);
        console.log('Page loaded from PDF document');

        // 计算缩放比例
        const viewport = page.getViewport({ scale: 1.5 });
        const parentWidth = canvas.parentElement?.clientWidth || 800;
        const scale = Math.min(parentWidth / viewport.width, 1.5);
        const scaledViewport = page.getViewport({ scale });

        console.log('Viewport calculated:', {
          width: scaledViewport.width,
          height: scaledViewport.height,
          scale
        });

        // 设置canvas尺寸
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        console.log('Canvas dimensions set:', {
          width: canvas.width,
          height: canvas.height,
          outputScale
        });

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        // 清空canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 渲染PDF页面
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          transform,
        };

        console.log('Starting render operation...');
        const task = page.render(renderContext);
        renderTaskRef.current = task;

        await task.promise;

        if (!mounted) {
          console.log('Component unmounted during render');
          return;
        }

        console.log('Page rendered successfully');
        renderTaskRef.current = null;

        // 更新进度
        const progress = Math.round((currentPage / totalPages) * 100);
        if (onProgressChange) {
          onProgressChange(progress);
        }

        console.log(`Progress: ${progress}%`);
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
          console.log('Rendering was cancelled (expected behavior)');
        } else {
          console.error('Error rendering page:', err);
          if (mounted) {
            setError(`渲染PDF页面失败: ${err.message || '未知错误'}`);
          }
        }
      }
    };

    renderPage();

    return () => {
      mounted = false;
      console.log('Page render cleanup');
      if (renderTaskRef.current) {
        console.log('Cancelling render task in cleanup');
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocRef.current, currentPage, totalPages, canvasReady, loading, onProgressChange]);

  // 更新页面时通知父组件
  useEffect(() => {
    if (totalPages > 0 && onPageChange) {
      onPageChange(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const goToNextPage = () => {
    console.log('Next page requested');
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    console.log('Previous page requested');
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // 导出方法供父组件调用
  useEffect(() => {
    (window as any).pdfReaderControls = {
      nextPage: goToNextPage,
      prevPage: goToPrevPage,
    };
    console.log('PDF controls exported to window');
  }, [currentPage, totalPages]);

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
          <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
            请确保文件是有效的PDF格式，并查看浏览器控制台获取详细信息
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <canvas
        ref={setCanvasRef}
        className={`max-w-full h-auto rounded-2xl shadow-2xl ${
          theme === 'dark' ? 'bg-white' : 'bg-white'
        }`}
      />
      <div className={`mt-6 text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
        第 {currentPage} 页 / 共 {totalPages} 页
      </div>
    </div>
  );
}
