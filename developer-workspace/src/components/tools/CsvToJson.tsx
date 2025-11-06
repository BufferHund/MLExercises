import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

export default function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    try {
      const lines = input.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV 数据至少需要包含标题行和一行数据');
        setOutput('');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim());
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        const obj: Record<string, string> = {};
        const values = lines[i].split(',').map((v) => v.trim());
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        result.push(obj);
      }

      setOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="粘贴 CSV 数据..."
        className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm resize-none"
      />

      <div className="flex gap-3">
        <button
          onClick={convert}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          转换
        </button>
        <button
          onClick={copyToClipboard}
          disabled={!output}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {output && (
        <pre className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
          {output}
        </pre>
      )}
    </div>
  );
}
