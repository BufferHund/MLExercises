import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Camera, Calendar, Aperture } from 'lucide-react';
import exifr from 'exifr';

interface ExifData {
  [key: string]: any;
}

export default function ExifViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setFile(file);
    setError('');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);

    try {
      const data = await exifr.parse(file, {
        translateKeys: false,
        translateValues: false,
        reviveValues: true
      });

      if (data && Object.keys(data).length > 0) {
        setExifData(data);
      } else {
        setError('该图片不包含EXIF信息');
        setExifData(null);
      }
    } catch (err) {
      setError('读取EXIF信息失败');
      setExifData(null);
    } finally {
      setLoading(false);
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

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toLocaleString('zh-CN');
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getKeyDisplayName = (key: string): string => {
    const names: { [key: string]: string } = {
      'Make': '相机制造商',
      'Model': '相机型号',
      'DateTime': '拍摄时间',
      'DateTimeOriginal': '原始时间',
      'ExposureTime': '曝光时间',
      'FNumber': 'F光圈',
      'ISO': 'ISO感光度',
      'FocalLength': '焦距',
      'LensModel': '镜头型号',
      'Flash': '闪光灯',
      'WhiteBalance': '白平衡',
      'GPSLatitude': 'GPS纬度',
      'GPSLongitude': 'GPS经度',
      'GPSAltitude': 'GPS海拔',
      'Software': '软件',
      'ImageWidth': '图片宽度',
      'ImageHeight': '图片高度',
      'Orientation': '方向',
      'XResolution': 'X分辨率',
      'YResolution': 'Y分辨率',
      'Copyright': '版权信息'
    };
    return names[key] || key;
  };

  const getHighlightedFields = (data: ExifData) => {
    const fields = [
      { key: 'Make', icon: Camera, label: '制造商' },
      { key: 'Model', icon: Camera, label: '型号' },
      { key: 'DateTime', icon: Calendar, label: '拍摄时间' },
      { key: 'FNumber', icon: Aperture, label: 'F光圈' },
    ];

    return fields.filter(f => data[f.key]).map(f => ({
      ...f,
      value: formatValue(data[f.key])
    }));
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
          <p className="text-slate-400 text-sm">支持 JPG, PNG, TIFF 等格式</p>
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
          {/* Preview */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="text-slate-300 font-medium mb-4 text-center">图片预览</div>
            <div className="flex justify-center">
              <img src={preview} alt="Preview" className="max-w-full max-h-96 rounded-lg" />
            </div>
          </div>

          {loading && (
            <div className="text-center text-slate-400 py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4">正在读取EXIF信息...</p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
              <p className="text-yellow-300 text-center">{error}</p>
            </div>
          )}

          {exifData && !loading && (
            <>
              {/* Highlighted Info */}
              {getHighlightedFields(exifData).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getHighlightedFields(exifData).map((field) => (
                    <div key={field.key} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <field.icon className="w-4 h-4 text-blue-400" />
                        <div className="text-slate-400 text-xs">{field.label}</div>
                      </div>
                      <div className="text-white text-sm font-medium">{field.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* All EXIF Data */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-medium mb-4">完整EXIF信息</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(exifData).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 py-2 border-b border-slate-700 last:border-0">
                      <div className="text-slate-400 text-sm font-medium min-w-[120px]">
                        {getKeyDisplayName(key)}
                      </div>
                      <div className="text-white text-sm flex-1 break-all">
                        {formatValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setFile(null);
                setPreview('');
                setExifData(null);
                setError('');
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
