import { useState } from 'react';

export default function TokenCounter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{
    characters: number;
    chineseChars: number;
    estimatedTokens: number;
  } | null>(null);

  const count = () => {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    const estimatedTokens = Math.ceil(chineseChars + otherChars / 4);

    setResult({
      characters: text.length,
      chineseChars,
      estimatedTokens,
    });
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文本..."
        className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm resize-none"
      />

      <button
        onClick={count}
        className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
      >
        计算
      </button>

      {result && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60">字符数:</span>
            <span className="text-white font-mono">{result.characters}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">中文字符:</span>
            <span className="text-white font-mono">{result.chineseChars}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">预估 Tokens:</span>
            <span className="text-white font-mono">~{result.estimatedTokens}</span>
          </div>
          <div className="text-xs text-white/40 mt-2">
            注: 这是粗略估算，实际 token 数取决于具体模型
          </div>
        </div>
      )}
    </div>
  );
}
