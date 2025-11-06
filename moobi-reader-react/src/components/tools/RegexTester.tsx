import { useState } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<{
    matches: string[];
    count: number;
  } | null>(null);

  const test = () => {
    try {
      const regex = new RegExp(pattern, 'g');
      const matches = text.match(regex);

      if (matches) {
        setResult({
          matches,
          count: matches.length,
        });
      } else {
        setResult({
          matches: [],
          count: 0,
        });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '无效的正则表达式');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        placeholder="正则表达式"
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="测试文本"
        className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm resize-none"
      />

      <button
        onClick={test}
        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
      >
        测试
      </button>

      {result && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60">匹配数:</span>
            <span className="text-white font-mono">{result.count}</span>
          </div>
          {result.matches.length > 0 && (
            <div>
              <div className="text-white/60 mb-2">匹配项:</div>
              <div className="text-white font-mono text-sm space-y-1">
                {result.matches.map((match, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded-lg">
                    {match}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
