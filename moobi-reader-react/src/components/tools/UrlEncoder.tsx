import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = () => {
    setOutput(encodeURIComponent(input));
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (e) {
      setOutput('解码错误');
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
        placeholder="输入 URL..."
        className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm resize-none"
      />

      <div className="flex gap-3">
        <button
          onClick={encode}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          编码
        </button>
        <button
          onClick={decode}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          解码
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

      {output && (
        <textarea
          value={output}
          readOnly
          className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-sm resize-none"
        />
      )}
    </div>
  );
}
