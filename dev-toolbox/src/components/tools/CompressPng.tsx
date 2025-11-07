import { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, RefreshCw } from 'lucide-react';

export default function CompressPng() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [compressedPreview, setCompressedPreview] = useState<string>('');
  const [scale, setScale] = useState(100);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setOriginalFile(file);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalPreview(dataUrl);
      compressImage(dataUrl, scale);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (dataUrl: string, scalePercent: number) => {
    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleFactor = scalePercent / 100;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Use better image smoothing for downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedSize(blob.size);
              const url = URL.createObjectURL(blob);
              setCompressedPreview(url);
            }
            setProcessing(false);
          },
          'image/png'
        );
      }
    };
    img.src = dataUrl;
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    if (originalPreview) {
      compressImage(originalPreview, newScale);
    }
  };

  const handleDownload = () => {
    if (!compressedPreview) return;

    const link = document.createElement('a');
    link.href = compressedPreview;
    link.download = `compressed_${originalFile?.name || 'image.png'}`;
    link.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!originalFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-2xl p-12 text-center cursor-pointer transition-colors"
        >
          <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">拖拽图片到此处或点击上传</p>
          <p className="text-slate-400 text-sm">支持 PNG, JPG, WebP 等格式</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Scale Control */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-white font-medium">缩放比例</label>
              <span className="text-2xl font-bold text-blue-400">{scale}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={scale}
              onChange={(e) => handleScaleChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>10% (最小)</span>
              <span>100% (原始大小)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">原始大小</div>
              <div className="text-white text-lg font-bold">{formatSize(originalSize)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">压缩后</div>
              <div className="text-white text-lg font-bold">{formatSize(compressedSize)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">节省空间</div>
              <div className="text-green-400 text-lg font-bold">{compressionRatio}%</div>
            </div>
          </div>

          {/* Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-slate-300 font-medium text-center">原始图片</div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <img src={originalPreview} alt="Original" className="w-full h-auto rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-slate-300 font-medium text-center">
                压缩后 {processing && <RefreshCw className="w-4 h-4 inline animate-spin" />}
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                {compressedPreview && (
                  <img src={compressedPreview} alt="Compressed" className="w-full h-auto rounded-lg" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              disabled={!compressedPreview || processing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl font-medium text-white transition-colors"
            >
              <Download className="w-5 h-5" />
              下载压缩图片
            </button>
            <button
              onClick={() => {
                setOriginalFile(null);
                setOriginalPreview('');
                setCompressedPreview('');
                setOriginalSize(0);
                setCompressedSize(0);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-white transition-colors"
            >
              <Upload className="w-5 h-5" />
              重新上传
            </button>
          </div>
        </>
      )}
    </div>
  );
}
