import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function HtmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const formatHtml = (html: string) => {
    try {
      let formatted = '';
      let indent = 0;
      const tab = '  ';

      // Simple HTML formatter
      const tokens = html
        .replace(/>\s*</g, '>\n<')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

      tokens.forEach(token => {
        if (token.match(/^<\/\w/)) {
          // Closing tag
          indent = Math.max(0, indent - 1);
          formatted += tab.repeat(indent) + token + '\n';
        } else if (token.match(/^<\w[^>]*>$/)) {
          // Opening tag
          formatted += tab.repeat(indent) + token + '\n';
          if (!token.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) {
            indent++;
          }
        } else if (token.match(/^<\w[^>]*\/>/)) {
          // Self-closing tag
          formatted += tab.repeat(indent) + token + '\n';
        } else {
          // Text or other
          formatted += tab.repeat(indent) + token + '\n';
        }
      });

      setOutput(formatted);
    } catch (err) {
      setOutput('格式化失败');
    }
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    formatHtml(input);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('复制失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="block text-white font-medium">输入HTML</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴HTML代码..."
            className="w-full h-96 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-mono resize-none focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-white font-medium">格式化结果</label>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的HTML将显示在这里..."
            className="w-full h-96 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-mono resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleFormat}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors"
        >
          格式化
        </button>
        <button
          onClick={() => {
            setInput('');
            setOutput('');
          }}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-white transition-colors"
        >
          清空
        </button>
      </div>
    </div>
  );
}
