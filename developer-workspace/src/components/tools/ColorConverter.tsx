import { useState } from 'react';

export default function ColorConverter() {
  const [color, setColor] = useState('#3b82f6');
  const [result, setResult] = useState<{
    hex: string;
    rgb: string;
    rgba: string;
  } | null>(null);

  const convert = () => {
    const hex = color.startsWith('#') ? color : '#' + color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      alert('无效的颜色值');
      return;
    }

    setResult({
      hex: hex.toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-20 h-12 rounded-xl cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#3b82f6"
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono"
        />
      </div>

      <button
        onClick={convert}
        className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
      >
        转换
      </button>

      {result && (
        <div className="space-y-3">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">HEX:</span>
              <span className="text-white font-mono">{result.hex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">RGB:</span>
              <span className="text-white font-mono">{result.rgb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">RGBA:</span>
              <span className="text-white font-mono">{result.rgba}</span>
            </div>
          </div>
          <div
            style={{ backgroundColor: result.hex }}
            className="h-20 rounded-2xl border border-white/10"
          />
        </div>
      )}
    </div>
  );
}
