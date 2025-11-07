import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="mb-12">
      <label
        htmlFor="fileInput"
        className="group flex items-center justify-center gap-4 w-full p-7 bg-gradient-to-r from-primary via-secondary to-accent-purple rounded-3xl cursor-pointer shadow-glass-lg hover:shadow-glass-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-smooth relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
        <Upload className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
        <span className="text-white font-bold text-xl tracking-wide relative z-10">
          选择文件或拖放到这里
        </span>
      </label>
      <input
        id="fileInput"
        type="file"
        accept=".epub,.pdf,.txt,.mobi,.azw,.azw3,.docx,.doc,.md"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-center text-white/60 text-sm mt-5 font-medium">
        支持 EPUB、PDF、TXT、MOBI、AZW3、DOCX、DOC、MD 格式 • 最大 500MB
      </p>
    </div>
  );
}
