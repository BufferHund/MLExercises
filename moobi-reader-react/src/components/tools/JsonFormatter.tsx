import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON');
      setOutput('');
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON');
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
        placeholder="粘贴 JSON 数据..."
        className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm resize-none"
      />

      <div className="flex gap-3">
        <button
          onClick={formatJSON}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          格式化
        </button>
        <button
          onClick={minifyJSON}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          压缩
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
