import { useState } from 'react';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState('');

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setUuids(uuid);
  };

  const generateMultiple = () => {
    const result = [];
    for (let i = 0; i < 10; i++) {
      result.push(
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })
      );
    }
    setUuids(result.join('\n'));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={generateUUID}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          生成 UUID
        </button>
        <button
          onClick={generateMultiple}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
        >
          生成 10 个
        </button>
      </div>

      {uuids && (
        <textarea
          value={uuids}
          readOnly
          className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-sm resize-none"
        />
      )}
    </div>
  );
}
