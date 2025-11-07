import { useState, useRef } from 'react';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';

export default function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [base64, setBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    if (!base64) return;

    try {
      await navigator.clipboard.writeText(base64);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('复制失败');
    }
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
      {/* Upload Area */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-2xl p-12 text-center cursor-pointer transition-colors"
        >
          <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">拖拽图片到此处或点击上传</p>
          <p className="text-slate-400 text-sm">支持 JPG, PNG, GIF, WebP 等格式</p>
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
          {/* File Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">文件名</div>
              <div className="text-white text-sm font-medium truncate">{file.name}</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">文件大小</div>
              <div className="text-white text-lg font-bold">{formatSize(file.size)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <div className="text-slate-400 text-sm mb-1">Base64大小</div>
              <div className="text-white text-lg font-bold">{formatSize(base64.length)}</div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="text-slate-300 font-medium mb-4 text-center">图片预览</div>
            <div className="flex justify-center">
              <img src={preview} alt="Preview" className="max-w-full max-h-96 rounded-lg" />
            </div>
          </div>

          {/* Base64 Output */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-slate-300 font-medium">Base64编码结果</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            </div>
            <textarea
              value={base64}
              readOnly
              className="w-full h-48 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-sm font-mono resize-none focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setFile(null);
                setPreview('');
                setBase64('');
                setCopied(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-white transition-colors"
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
