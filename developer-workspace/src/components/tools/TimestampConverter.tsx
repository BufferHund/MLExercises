import { useState } from 'react';

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    datetime: string;
    timestamp: number;
    timestampMs: number;
    iso: string;
  } | null>(null);

  const convert = () => {
    try {
      let date: Date;
      if (/^\d+$/.test(input)) {
        const timestamp = input.length === 10 ? parseInt(input) * 1000 : parseInt(input);
        date = new Date(timestamp);
      } else {
        date = new Date(input);
      }

      if (isNaN(date.getTime())) {
        alert('无效的日期或时间戳');
        return;
      }

      setResult({
        datetime: date.toLocaleString('zh-CN'),
        timestamp: Math.floor(date.getTime() / 1000),
        timestampMs: date.getTime(),
        iso: date.toISOString(),
      });
    } catch (e) {
      alert('转换失败');
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    setResult({
      datetime: now.toLocaleString('zh-CN'),
      timestamp: Math.floor(now.getTime() / 1000),
      timestampMs: now.getTime(),
      iso: now.toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入时间戳或日期"
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
      />

      <div className="flex gap-3">
        <button
          onClick={convert}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          转换
        </button>
        <button
          onClick={getCurrentTime}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          当前时间
        </button>
      </div>

      {result && (
        <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex justify-between">
            <span className="text-white/60">日期时间:</span>
            <span className="text-white font-mono">{result.datetime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">时间戳(秒):</span>
            <span className="text-white font-mono">{result.timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">时间戳(毫秒):</span>
            <span className="text-white font-mono">{result.timestampMs}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">ISO 8601:</span>
            <span className="text-white font-mono text-sm">{result.iso}</span>
          </div>
        </div>
      )}
    </div>
  );
}
