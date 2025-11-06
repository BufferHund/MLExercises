import { useState } from 'react';

export default function MarkdownPreview() {
  const [input, setInput] = useState('');
  const [html, setHtml] = useState('');

  const preview = () => {
    let result = input
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/# (.*)/g, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');

    setHtml('<p class="mb-3">' + result + '</p>');
  };

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入 Markdown..."
        className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm resize-none"
      />

      <button
        onClick={preview}
        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
      >
        预览
      </button>

      {html && (
        <div
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
