import { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Shield, Info } from 'lucide-react';

export default function ExifRemover() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [cleanedPreview, setCleanedPreview] = useState<string>('');
  const [originalSize, setOriginalSize] = useState(0);
  const [cleanedSize, setCleanedSize] = useState(0);
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
      removeExif(dataUrl, file.type);
    };
    reader.readAsDataURL(file);
  };

  const removeExif = (dataUrl: string, mimeType: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // Convert to the output format
        const outputType = mimeType.includes('png') ? 'image/png' : 'image/jpeg';
        const quality = outputType === 'image/jpeg' ? 0.95 : undefined;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCleanedSize(blob.size);
              const url = URL.createObjectURL(blob);
              setCleanedPreview(url);
            }
          },
          outputType,
          quality
        );
      }
    };
    img.src = dataUrl;
  };

  const handleDownload = () => {
    if (!cleanedPreview) return;

    const extension = originalFile?.type.includes('png') ? '.png' : '.jpg';
    const link = document.createElement('a');
    link.href = cleanedPreview;
    link.download = `cleaned_${originalFile?.name?.replace(/\.[^.]+$/, extension) || 'image' + extension}`;
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

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-medium mb-1">为什么要删除EXIF？</p>
          <p className="text-blue-300/80">
            EXIF数据可能包含敏感信息(如GPS位置、相机型号、拍摄时间等)。删除EXIF可以保护隐私,同时通常还能减小文件大小。
          </p>
        </div>
      </div>

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
          <p className="text-slate-400 text-sm">支持 JPG, PNG, WebP 等格式</p>
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">原始大小</div>
              <div className="text-white text-lg font-bold">{formatSize(originalSize)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">清理后</div>
              <div className="text-white text-lg font-bold">{formatSize(cleanedSize)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-green-400 text-sm font-medium">EXIF已删除</div>
            </div>
          </div>

          {/* Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-slate-300 font-medium text-center">原始图片 (含EXIF)</div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <img src={originalPreview} alt="Original" className="w-full h-auto rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-slate-300 font-medium text-center">清理后 (无EXIF)</div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                {cleanedPreview && (
                  <img src={cleanedPreview} alt="Cleaned" className="w-full h-auto rounded-lg" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              disabled={!cleanedPreview}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl font-medium text-white transition-colors"
            >
              <Download className="w-5 h-5" />
              下载清理后的图片
            </button>
            <button
              onClick={() => {
                setOriginalFile(null);
                setOriginalPreview('');
                setCleanedPreview('');
                setOriginalSize(0);
                setCleanedSize(0);
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
