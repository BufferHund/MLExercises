import { useState } from 'react';

export default function HashCalculator() {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');

  const calculate = async () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    } catch (e) {
      alert('计算失败');
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入文本..."
        className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm resize-none"
      />

      <button
        onClick={calculate}
        className="w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-gray-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
      >
        计算
      </button>

      {hash && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-white/60 mb-2">SHA-256:</div>
          <div className="text-white font-mono text-sm break-all">{hash}</div>
        </div>
      )}
    </div>
  );
}
