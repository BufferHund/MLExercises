import { useEffect, useRef, useState } from 'react';
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
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载PDF文件
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        setLoading(false);

        if (onPageChange) {
          onPageChange(1, pdfDoc.numPages);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('加载PDF文件失败');
        setLoading(false);
      }
    };

    loadPdf();
  }, [file, onPageChange]);

  // 渲染当前页
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;

        // 计算缩放比例
        const viewport = page.getViewport({ scale: 1.5 });
        const scale = Math.min(
          (canvas.parentElement?.clientWidth || 800) / viewport.width,
          1.5
        );
        const scaledViewport = page.getViewport({ scale });

        // 设置canvas尺寸
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        // 渲染PDF页面
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          transform,
        };

        await page.render(renderContext).promise;

        // 更新进度
        const progress = Math.round((currentPage / totalPages) * 100);
        if (onProgressChange) {
          onProgressChange(progress);
        }
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('渲染PDF页面失败');
      }
    };

    renderPage();
  }, [pdf, currentPage, totalPages, onProgressChange]);

  // 更新页面时通知父组件
  useEffect(() => {
    if (totalPages > 0 && onPageChange) {
      onPageChange(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
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
    <div className="flex flex-col items-center justify-center w-full">
      <canvas
        ref={canvasRef}
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
